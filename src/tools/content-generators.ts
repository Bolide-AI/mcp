import { z } from 'zod';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { registerTool } from './common.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { log } from '../utils/logger.js';
import { APIError, ValidationError } from '../utils/errors.js';
import { getProjectPath } from '../utils/workspace.js';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { BOLIDEAI_API_URL } from '../utils/constants.js';

import * as fs from 'fs';

const AnalyzeScreencastsSchema = z.object({
  screencastNames: z.array(z.string()).describe('Names of the screencast files to analyze'),
  force: z
    .boolean()
    .describe('Whether to force the analysis even if the analysis file already exists'),
  customPrompt: z
    .string()
    .optional()
    .describe('Optional custom prompt for video analysis. If not provided, uses the default comprehensive analysis prompt.'),
});

const GenerateGifSchema = z.object({
  screencastName: z.string().describe('Name of the screencast file to convert to GIF'),
  startTime: z.string().describe('Start timestamp in format HH:MM:SS or MM:SS'),
  endTime: z.string().describe('End timestamp in format HH:MM:SS or MM:SS'),
});

const EnhanceAudioSchema = z.object({
  screencastNames: z.array(z.string()).describe('Names of the screencast files to extract audio from'),
});

type AnalyzeScreencastsParams = z.infer<typeof AnalyzeScreencastsSchema>;
type GenerateGifParams = z.infer<typeof GenerateGifSchema>;
type EnhanceAudioParams = z.infer<typeof EnhanceAudioSchema>;

async function enhanceAudioWithSpeech(audioPath: string): Promise<string> {
  const enhancedAudioPath = audioPath.replace(/\.mp3$/, '_enhanced.mp3');

  try {
    log('info', `Enhancing audio ${audioPath} via web API`);

    const webApiUrl = process.env.BOLIDEAI_API_URL || BOLIDEAI_API_URL;
    const authToken = process.env.BOLIDEAI_API_TOKEN;

    if (!authToken) {
      throw new ValidationError('BOLIDEAI_API_TOKEN environment variable is required for audio enhancement');
    }

    const formData = new FormData();
    const audioFile = new File([fs.readFileSync(audioPath)], audioPath.split('/').pop() || 'audio.mp3', {
      type: 'audio/mpeg'
    });
    formData.append('audio_file', audioFile);

    const response = await fetch(`${webApiUrl}/tools/enhance-audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `BOLIDEAI API error: ${response.status} ${response.statusText} - ${errorText}`);

      if (response.status === 401) {
        throw new APIError('Authentication failed. Please check your BOLIDEAI API token.', 401);
      } else if (response.status === 422) {
        throw new APIError('Audio file validation failed. Please check the file format and size.', 422);
      } else if (response.status === 429) {
        throw new APIError('Rate limit exceeded. Please try again later.', 429);
      } else {
        throw new APIError(`Failed to enhance audio: ${errorText}`, response.status);
      }
    }

    const data = await response.json();

    if (!data.success) {
      throw new APIError(`Audio enhancement failed: ${data.error || 'Unknown error'}`);
    }

    log('info', `Downloading enhanced audio from temporary URL: ${data.download_url}`);

    const downloadResponse = await fetch(data.download_url);

    if (!downloadResponse.ok) {
      throw new APIError('Failed to download enhanced audio file from temporary URL', 404);
    }

    const enhancedAudioBuffer = await downloadResponse.arrayBuffer();
    writeFileSync(enhancedAudioPath, new Uint8Array(enhancedAudioBuffer));

    log('info', `Successfully enhanced audio: ${enhancedAudioPath}`);
    log('info', `Temporary URL expires in: ${data.url_expires_in}`);

    return enhancedAudioPath;
  } catch (error) {
    log('error', `Failed to enhance audio ${audioPath}: ${error}`);

    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new Error(`Failed to enhance audio: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function analyzeScreencasts(params: AnalyzeScreencastsParams): Promise<
  {
    analysis_file: string;
    existing_analysis: boolean;
    screencastName: string;
    description: string;
    timestampedEvents: {
      startTime: string;
      endTime: string;
      eventType: string;
      description: string;
    }[];
  }[]
> {
  let { screencastNames, force, customPrompt } = params;

  log('info', `Analyzing screencasts: ${screencastNames.join(', ')}`);
  
  if (customPrompt) {
    log('info', `Using custom prompt for analysis: ${customPrompt}`);
  }

  const projectPath = getProjectPath();
  const screencastsPath = join(projectPath, 'screencasts');

  let results = [];

  if (!force) {
    for (const screencastName of screencastNames) {
      const jsonFileName = screencastName.replace(/\.[^/.]+$/, '.json');
      const jsonFilePath = join(screencastsPath, jsonFileName);

      if (existsSync(jsonFilePath)) {
        log('info', `Analysis file already exists for ${screencastName}, skipping analysis`);

        const analysis = JSON.parse(readFileSync(jsonFilePath, 'utf8'));

        results.push({
          ...analysis,
          analysis_file: jsonFilePath,
          existing_analysis: true,
        });

        screencastNames = screencastNames.filter((name: string) => name !== screencastName);
        continue;
      }
    }

    if (screencastNames.length === 0) {
      log('info', `All screencasts have existing analyses, returning existing results`);
      return results;
    }
  }

  const webApiUrl = process.env.BOLIDEAI_API_URL || BOLIDEAI_API_URL;
  const authToken = process.env.BOLIDEAI_API_TOKEN;

  try {
    log('info', `Calling web API for screencast analysis: ${webApiUrl}/tools/analyze-videos`);

    if (!authToken) {
      throw new ValidationError('BOLIDEAI_API_TOKEN environment variable is required for screencast analysis via web API');
    }

    const formData = new FormData();

    for (const screencastName of screencastNames) {
      const screencastPath = join(screencastsPath, screencastName);

      if (!existsSync(screencastPath)) {
        throw new ValidationError(`Screencast file not found: ${screencastPath}`);
      }

      const screencastFile = new File([readFileSync(screencastPath)], screencastName, {
        type: 'video/mp4'
      });
      formData.append('video_files[]', screencastFile);
    }

    if (force) {
      formData.append('force', 'true');
    }

    if (customPrompt) {
      formData.append('custom_prompt', customPrompt);
    }

    const response = await fetch(`${webApiUrl}/tools/analyze-videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `Web API error: ${response.status} ${response.statusText} - ${errorText}`);

      if (response.status === 401) {
        throw new APIError('Authentication failed. Please check your auth token.', 401);
      } else if (response.status === 422) {
        throw new APIError('Screencast file validation failed. Please check the file format and size.', 422);
      } else if (response.status === 429) {
        throw new APIError('Rate limit exceeded. Please try again later.', 429);
      } else {
        throw new APIError(`Failed to analyze screencasts via web API: ${errorText}`, response.status);
      }
    }

    const data = await response.json();

    if (!data.success) {
      throw new APIError(`Screencast analysis failed: ${data.error || 'Unknown error'}`);
    }

    if (!data.analyses || !Array.isArray(data.analyses)) {
      throw new APIError('Invalid response format from web API');
    }

    log('info', `Successfully received ${data.analyses.length} screencast analyses from web API`);

    const analysisResults = [];

    for (let i = 0; i < data.analyses.length; i++) {
      const analysis = data.analyses[i];
      const screencastName = analysis.screencastName || analysis.videoName;
      
      let jsonFileName = screencastName.replace(/\.[^/.]+$/, '.json');
      
      if (analysis.fileSuffix) {
        const baseName = screencastName.replace(/\.[^/.]+$/, '');
        jsonFileName = `${baseName}_${analysis.fileSuffix.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}.json`;
        log('info', `Using custom file suffix: ${analysis.fileSuffix} for ${screencastName}`);
      }
      
      const jsonFilePath = join(screencastsPath, jsonFileName);

      try {
        const updatedAnalysis = { ...analysis };

        if (analysis.fileSuffix) {
          updatedAnalysis.result = analysis.description;
          delete updatedAnalysis.description;
        }

        delete updatedAnalysis.videoName;
        delete updatedAnalysis.fileSuffix;
        
        writeFileSync(jsonFilePath, JSON.stringify(updatedAnalysis, null, 2), 'utf8');

        analysisResults.push({
          ...updatedAnalysis,
          analysis_file: jsonFilePath,
          existing_analysis: false,
        });

        log('info', `Saved analysis for ${screencastName} to ${jsonFilePath}`);
      } catch (error) {
        log('warn', `Failed to save analysis for ${screencastName}: ${error}`);

        analysisResults.push({
          ...analysis,
          screencastName,
          analysis_file: '',
          existing_analysis: false,
        });
      }
    }

    results.push(...analysisResults);

    log('info', `Successfully analyzed all ${screencastNames.length} screencasts via web API and saved JSON files`);

    return results;
  } catch (error) {
    log('error', `Failed to analyze screencasts via web API: ${error}`);

    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new Error(
      `Failed to analyze screencasts via web API: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function generateGif(params: GenerateGifParams): Promise<string> {
  const { screencastName, startTime, endTime } = params;

  log(
    'info',
    `Generating GIF from screencast ${screencastName} from ${startTime} to ${endTime}`,
  );

  const projectPath = getProjectPath();
  const screencastsPath = join(projectPath, 'screencasts');
  const screencastPath = join(screencastsPath, screencastName);
  const gifsPath = join(projectPath, 'gifs');

  try {
    if (!existsSync(screencastPath)) {
      throw new ValidationError(`Screencast file not found: ${screencastPath}`);
    }

    if (!existsSync(gifsPath)) {
      execSync(`mkdir -p "${gifsPath}"`, { stdio: 'pipe' });
      log('info', `Created gifs directory: ${gifsPath}`);
    }

    const gifName = `${screencastName.replace(/\.[^/.]+$/, '')}_${startTime.replace(/:/g, '-')}_to_${endTime.replace(/:/g, '-')}.gif`;
    const gifPath = join(gifsPath, gifName);

    log('info', `Analyzing screencast properties: ${screencastPath}`);

    const probeCommand = `ffprobe -v quiet -print_format json -show_streams "${screencastPath}"`;
    const probeOutput = execSync(probeCommand, { encoding: 'utf8' });
    const probeData = JSON.parse(probeOutput);

    const videoStream = probeData.streams.find((stream: any) => stream.codec_type === 'video');
    if (!videoStream) {
      throw new Error('No video stream found in the file');
    }

    const width = videoStream.width;
    const height = videoStream.height;

    const frameRateFraction = videoStream.r_frame_rate;
    const [numerator, denominator] = frameRateFraction.split('/').map(Number);
    const originalFrameRate = denominator ? numerator / denominator : numerator;

    const maxGifFrameRate = 30;
    const gifFrameRate = Math.min(originalFrameRate, maxGifFrameRate);

    log(
      'info',
      `Screencast properties - Width: ${width}, Height: ${height}, Original Frame Rate: ${originalFrameRate} fps`,
    );
    log(
      'info',
      `GIF will be generated at ${gifFrameRate} fps (capped at ${maxGifFrameRate} fps for optimal GIF performance)`,
    );
    log('info', `Creating GIF: ${gifPath}`);

    const paletteCommand = `ffmpeg -ss ${startTime} -to ${endTime} -i "${screencastPath}" -vf "fps=${gifFrameRate},scale=${width}:${height}:flags=lanczos,palettegen" -y "${gifPath}.palette.png"`;
    execSync(paletteCommand, { stdio: 'pipe' });

    const gifCommand = `ffmpeg -ss ${startTime} -to ${endTime} -i "${screencastPath}" -i "${gifPath}.palette.png" -lavfi "fps=${gifFrameRate},scale=${width}:${height}:flags=lanczos[x];[x][1:v]paletteuse" -y "${gifPath}"`;
    execSync(gifCommand, { stdio: 'pipe' });

    execSync(`rm "${gifPath}.palette.png"`, { stdio: 'pipe' });

    if (!existsSync(gifPath)) {
      throw new Error('GIF file was not created successfully');
    }

    log(
      'info',
      `Successfully created GIF: ${gifPath} with dimensions (${width}x${height}) and frame rate (${gifFrameRate} fps)`,
    );

    return gifName;
  } catch (error) {
    log('error', `Failed to generate GIF: ${error}`);

    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new Error(
      `Failed to generate GIF: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function enhanceAudio(params: EnhanceAudioParams): Promise<{
  screencastName: string;
  success: boolean;
  errors: string[];
}[]> {
  const { screencastNames } = params;

  log('info', `Extracting and enhancing audio from screencasts: ${screencastNames.join(', ')}`);

  const projectPath = getProjectPath();
  const screencastsPath = join(projectPath, 'screencasts');

  const results: {
    screencastName: string;
    success: boolean;
    errors: string[];
  }[] = [];

  const tempFiles: string[] = [];

  for (const screencastName of screencastNames) {
    const screencastPath = join(screencastsPath, screencastName);

    if (!existsSync(screencastPath)) {
      log('warn', `Screencast file not found: ${screencastPath}, skipping`);
      continue;
    }

    const audioName = `${screencastName.replace(/\.[^/.]+$/, '')}.mp3`;
    const audioPath = join(screencastsPath, audioName);
    const enhancedAudioName = `${screencastName.replace(/\.[^/.]+$/, '')}_enhanced.mp3`;
    const enhancedAudioPath = join(screencastsPath, enhancedAudioName);

    let chunkErrors: Error[] = [];

    try {
      log('info', `Checking if ${screencastName} contains audio track`);

      const probeCommand = `ffprobe -v quiet -print_format json -show_streams "${screencastPath}"`;
      const probeOutput = execSync(probeCommand, { encoding: 'utf8' });
      const probeData = JSON.parse(probeOutput);

      const audioStream = probeData.streams.find((stream: any) => stream.codec_type === 'audio');
      if (!audioStream) {
        throw new Error(`Screencast file ${screencastName} does not contain an audio track`);
      }

      log('info', `Audio track found in ${screencastName}, proceeding with extraction`);
      log('info', `Extracting audio from ${screencastName} to ${audioName}`);

      const ffmpegCommand = `ffmpeg -i "${screencastPath}" -vn -acodec mp3 -ab 192k -ar 44100 -y "${audioPath}"`;
      execSync(ffmpegCommand, { stdio: 'pipe' });

      if (!existsSync(audioPath)) {
        throw new Error('Audio file was not created successfully');
      }

      tempFiles.push(audioPath);
      log('info', `Successfully extracted audio: ${audioPath}`);


      // Get audio duration
      const durationCommand = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`;
      const durationOutput = execSync(durationCommand, { encoding: 'utf8' });
      const totalDuration = parseFloat(durationOutput.trim());

      log('info', `Audio duration: ${totalDuration} seconds`);

      const chunkDuration = 300; // 300 seconds = 5 minutes
      const chunks: string[] = [];
      const enhancedChunks: string[] = [];

      if (totalDuration <= chunkDuration) {
        // Audio is short enough, enhance directly
        log('info', `Audio is ${totalDuration}s, enhancing directly without chunking`);

        try {
          const enhancedAudioPath = await enhanceAudioWithSpeech(audioPath);
          tempFiles.push(enhancedAudioPath);
        } catch (error) {
          log('error', `Failed to enhance audio for ${screencastName}: ${error}`);
          chunkErrors.push(error as Error);
        }
      } else {
        // Split audio into chunks
        log('info', `Audio is ${totalDuration}s, splitting into ${chunkDuration}s chunks`);

        let chunkIndex = 0;

        for (let startTime = 0; startTime < totalDuration; startTime += chunkDuration) {
          const endTime = Math.min(startTime + chunkDuration, totalDuration);
          const chunkName = `${screencastName.replace(/\.[^/.]+$/, '')}_chunk_${chunkIndex}.mp3`;
          const chunkPath = join(screencastsPath, chunkName);

          log('info', `Creating chunk ${chunkIndex}: ${startTime}s to ${endTime}s`);

          // Extract chunk
          const chunkCommand = `ffmpeg -i "${audioPath}" -ss ${startTime} -t ${endTime - startTime} -acodec copy -y "${chunkPath}"`;
          execSync(chunkCommand, { stdio: 'pipe' });

          if (!existsSync(chunkPath)) {
            throw new Error(`Chunk file was not created successfully: ${chunkPath}`);
          }

          chunks.push(chunkPath);
          tempFiles.push(chunkPath);

          // Enhance chunk
          try {
            const enhancedChunkPath = await enhanceAudioWithSpeech(chunkPath);
            enhancedChunks.push(enhancedChunkPath);
            tempFiles.push(enhancedChunkPath);
            log('info', `Successfully enhanced chunk ${chunkIndex}`);
          } catch (error) {
            log('error', `Failed to enhance chunk ${chunkIndex}: ${error}`);

            chunkErrors.push(error as Error);

            throw new Error(`Failed to enhance chunk ${chunkIndex}: ${error instanceof Error ? error.message : String(error)}`);
          }

          chunkIndex++;
        }

        if (enhancedChunks.length === 0) {
          throw new Error('No chunks were successfully created or enhanced');
        }

        // Create concat file for ffmpeg
        const concatFileName = `${screencastName.replace(/\.[^/.]+$/, '')}_concat.txt`;
        const concatFilePath = join(screencastsPath, concatFileName);
        const concatContent = enhancedChunks.map(chunk => `file '${chunk}'`).join('\n');
        
        writeFileSync(concatFilePath, concatContent, 'utf8');
        tempFiles.push(concatFilePath);

        // Merge enhanced chunks
        log('info', `Merging ${enhancedChunks.length} enhanced chunks into final audio`);
        const mergeCommand = `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c copy -y "${enhancedAudioPath}"`;
        execSync(mergeCommand, { stdio: 'pipe' });

        if (!existsSync(enhancedAudioPath)) {
          throw new Error('Enhanced merged audio file was not created successfully');
        }
      }

      log('info', `Successfully enhanced audio: ${enhancedAudioPath}`);

      const enhancedScreencastName = `${screencastName.replace(/\.[^/.]+$/, '')}_enhanced_audio${screencastName.match(/\.[^/.]+$/)?.[0] || '.mp4'}`;
      const enhancedScreencastPath = join(screencastsPath, enhancedScreencastName);

      log('info', `Creating enhanced screencast ${enhancedScreencastName} with enhanced audio`);

      const combineCommand = `ffmpeg -i "${screencastPath}" -i "${enhancedAudioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest -y "${enhancedScreencastPath}"`;
      execSync(combineCommand, { stdio: 'pipe' });

      if (!existsSync(enhancedScreencastPath)) {
        throw new Error('Enhanced screencast file was not created successfully');
      }

      results.push({
        screencastName: enhancedScreencastName,
        success: true,
        errors: [],
      });

      log('info', `Successfully created enhanced screencast: ${enhancedScreencastPath}`);

      // Add enhanced audio to temp files for cleanup
      tempFiles.push(enhancedAudioPath);
    } catch (error) {
      log('error', `Failed to enhance audio for ${screencastName}: ${error}`);

      results.push({
        screencastName: screencastName,
        success: false,
        errors: [error as Error].concat(chunkErrors).map(error => error.message),
      });
    }
  }

  log('info', `Cleaning up temporary files`);

  for (const tempFile of tempFiles) {
    try {
      if (existsSync(tempFile)) {
        execSync(`rm "${tempFile}"`, { stdio: 'pipe' });
        log('info', `Removed temporary file: ${tempFile}`);
      }
    } catch (error) {
      log('warn', `Failed to remove temporary file ${tempFile}: ${error}`);
    }
  }

  let failedResults = results.filter((result) => !result.success);

  if (failedResults.length > 0) {
    log('error', `${failedResults.length} screencasts failed to be enhanced. See the errors for details.`);
  } else {
    log('info', `Successfully created enhanced screencast files for all screencasts`);
  }

  return results;
}

export function registerContentGeneratorTools(server: McpServer): void {
  registerTool<AnalyzeScreencastsParams>(
    server,
    'analyze_screencasts',
    `Analyzes screencasts using Gemini API via the web API integration. IMPORTANT: You MUST provide the screencastNames and force parameters. Optionally provide customPrompt for specialized analysis. DO NOT MODIFY THE CUSTOM PROMPT, NEVER ASK FOR VISUAL ANALYSIS UNLESS USER EXPLICITLY ASKS FOR IT, USE WHAT THE USER ASKED FOR AS CUSTOM PROMPT. Example: analyze_screencasts({ screencastNames: ['screencast1.mp4', 'screencast2.mp4'], force: false, customPrompt: 'Focus on user interface errors and bugs' })`,
    AnalyzeScreencastsSchema.shape,
    async (params) => {
      try {
        const screencastAnalyses = await analyzeScreencasts(params);

        const nextSteps = [
          'Review the generated descriptions for each screencast',
          'Use the descriptions for content creation or documentation',
        ];

        if (screencastAnalyses.filter((analysis) => analysis.existing_analysis).length > 0) {
          nextSteps.push(
            'Some screencasts already have analyses, ask user if they want to force the analysis again',
          );
        }

        const response = {
          success: true,
          message: 'Successfully analyzed screencasts via web API',
          analyses: screencastAnalyses,
          existing_analyses:
            screencastAnalyses.filter((analysis) => analysis.existing_analysis).length > 0
              ? 'Some screencasts already have analyses, use the force parameter to force the analysis again'
              : 'All specified screencasts have new analyses',
          integration: 'web-api',
          nextSteps: nextSteps,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        log(
          'error',
          `Failed to analyze screencasts via web API: ${error instanceof Error ? error.message : String(error)}`,
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error occurred',
                  integration: 'web-api',
                },
                null,
                2,
              ),
            },
          ],
        };
      }
    },
  );

  registerTool<GenerateGifParams>(
    server,
    'generate_gif',
    `Generates a GIF from a screencast. IMPORTANT: You MUST provide the screencastName, startTime, and endTime parameters. Example: generate_gif({ screencastName: 'NAME_OF_SCREENCAST_FILE', startTime: '00:00:00', endTime: '00:00:00' })`,
    GenerateGifSchema.shape,
    async (params) => {
      try {
        const gifName = await generateGif(params);

        const response = {
          success: true,
          message: 'Successfully generated GIF',
          gifName: gifName,
          nextSteps: ['Ask the user if they want to refine the GIF'],
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        log(
          'error',
          `Failed to generate GIF: ${error instanceof Error ? error.message : String(error)}`,
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error occurred',
                },
                null,
                2,
              ),
            },
          ],
        };
      }
    },
  );

  registerTool<EnhanceAudioParams>(
    server,
    'enhance_audio',
    `Extracts audio from screencasts using ffmpeg and saves as MP3 files in the same directory. Automatically enhances audio using the web API which integrates with ElevenLabs speech-to-speech conversion with voice ID 29vD33N1CtxCmqQRPOHJ. Requires WEB_API_TOKEN and optionally WEB_API_URL environment variables. IMPORTANT: You MUST provide the screencastNames parameters. Example: enhance_audio({ screencastNames: ['screencast1.mp4', 'screencast2.mp4'] })`,
    EnhanceAudioSchema.shape,
    async (params) => {
      try {
        const result = await enhanceAudio(params);

        const nextSteps = [
          'Review the enhanced screencast files with improved speech quality',
          'Use the enhanced screencasts for content creation or analysis',
          'Compare the enhanced screencasts with the original versions',
        ];

        const response = {
          success: result.every((result) => result.success),
          result: result,
          nextSteps: nextSteps,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        log(
          'error',
          `Failed to create enhanced screencasts: ${error instanceof Error ? error.message : String(error)}`,
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error occurred',
                },
                null,
                2,
              ),
            },
          ],
        };
      }
    },
  );
}
