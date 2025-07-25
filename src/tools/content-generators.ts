import { z } from 'zod';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { registerTool } from './common.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { log } from '../utils/logger.js';
import { APIError, ValidationError } from '../utils/errors.js';
import { getWorkspacePath } from '../utils/workspace.js';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { DATAROUTE_API_URL, PROJECT_NAME } from '../utils/constants.js';

import * as fs from 'fs';

const AnalyzeVideosSchema = z.object({
  artifactName: z.string().describe('Name of the artifact directory where videos are stored'),
  videoNames: z.array(z.string()).describe('Names of the video files to analyze'),
  force: z
    .boolean()
    .describe('Whether to force the analysis even if the analysis file already exists'),
});

const GenerateGifSchema = z.object({
  artifactName: z.string().describe('Name of the artifact directory where the video is stored'),
  videoName: z.string().describe('Name of the video file to convert to GIF'),
  startTime: z.string().describe('Start timestamp in format HH:MM:SS or MM:SS'),
  endTime: z.string().describe('End timestamp in format HH:MM:SS or MM:SS'),
});

const EnhanceAudioSchema = z.object({
  artifactName: z.string().describe('Name of the artifact directory where videos are stored'),
  videoNames: z.array(z.string()).describe('Names of the video files to extract audio from'),
});

const FetchRedditPostsSchema = z.object({
  subreddit: z.string().describe('Name of the subreddit to fetch posts from'),
  limit: z.number().optional().describe('Number of posts to fetch (1-100, default: 25)'),
  sort: z.enum(['hot', 'new', 'top', 'rising']).optional().describe('Sort order for posts (default: top)'),
  timePeriod: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']).optional().describe('Time period for top posts (default: day)'),
});

type AnalyzeVideosParams = z.infer<typeof AnalyzeVideosSchema>;
type GenerateGifParams = z.infer<typeof GenerateGifSchema>;
type EnhanceAudioParams = z.infer<typeof EnhanceAudioSchema>;
type FetchRedditPostsParams = z.infer<typeof FetchRedditPostsSchema>;

async function fetchRedditPosts(params: FetchRedditPostsParams): Promise<{
  posts: Array<{
    id: string;
    title: string;
    url: string;
    score: number;
    author: string;
    created_utc: string;
    num_comments: number;
    permalink: string;
    subreddit: string;
    thumbnail: string | null;
    is_video: boolean;
    domain: string;
    body: string | null;
  }>;
  meta: {
    subreddit: string;
    count: number;
    sort: string;
    time_period: string;
    limit: number;
  };
}> {
  const {
    subreddit,
    limit = 25,
    sort = 'top',
    timePeriod = 'day'
  } = params;

  const apiUrl = process.env.DATAROUTE_API_URL || DATAROUTE_API_URL;
  const authToken = process.env.DATAROUTE_API_TOKEN;

  if (!authToken) {
    throw new ValidationError('DATAROUTE_API_TOKEN environment variable is required to fetch Reddit posts');
  }

  const url = new URL(`${apiUrl}/reddit/${subreddit}/posts`);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('sort', sort);
  url.searchParams.append('t', timePeriod);

  try {
    log('info', `Fetching Reddit posts from r/${subreddit}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `Reddit API error: ${response.status} ${response.statusText} - ${errorText}`);

      if (response.status === 401) {
        throw new APIError('Authentication failed. Please check your Reddit account connection.', 401);
      } else if (response.status === 404) {
        throw new APIError(`Subreddit r/${subreddit} not found or is private.`, 404);
      } else if (response.status === 429) {
        throw new APIError('Rate limit exceeded. Please try again later.', 429);
      } else {
        throw new APIError(`Failed to fetch Reddit posts: ${errorText}`, response.status);
      }
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      throw new APIError('Invalid response format from Reddit API');
    }

    log('info', `Successfully fetched ${data.data.length} posts from r/${subreddit}`);

    return {
      posts: data.data,
      meta: data.meta,
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    log('error', `Failed to fetch Reddit posts: ${error instanceof Error ? error.message : String(error)}`);
    throw new APIError(`Failed to fetch Reddit posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function enhanceAudioWithSpeech(audioPath: string): Promise<string> {
  const enhancedAudioPath = audioPath.replace(/\.mp3$/, '_enhanced.mp3');

  try {
    log('info', `Enhancing audio ${audioPath} via web API`);

    const webApiUrl = process.env.DATAROUTE_API_URL || DATAROUTE_API_URL;
    const authToken = process.env.DATAROUTE_API_TOKEN;

    if (!authToken) {
      throw new ValidationError('DATAROUTE_API_TOKEN environment variable is required for audio enhancement');
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
      log('error', `DATAROUTE API error: ${response.status} ${response.statusText} - ${errorText}`);

      if (response.status === 401) {
        throw new APIError('Authentication failed. Please check your DATAROUTE API token.', 401);
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

async function analyzeVideos(params: AnalyzeVideosParams): Promise<
  {
    analysis_file: string;
    existing_analysis: boolean;
    videoName: string;
    description: string;
    timestampedEvents: {
      startTime: string;
      endTime: string;
      eventType: string;
      description: string;
    }[];
  }[]
> {
  let { artifactName, videoNames, force } = params;

  log('info', `Analyzing videos in ${artifactName}: ${videoNames.join(', ')}`);

  const workspacePath = getWorkspacePath();
  const artifactDirectory = join(workspacePath, PROJECT_NAME, 'artifacts', artifactName);
  const videosDir = join(artifactDirectory, 'videos');

  let results = [];

  if (!force) {
    for (const videoName of videoNames) {
      const jsonFileName = videoName.replace(/\.[^/.]+$/, '.json');
      const jsonFilePath = join(artifactDirectory, 'videos', jsonFileName);

      if (existsSync(jsonFilePath)) {
        log('info', `Analysis file already exists for ${videoName}, skipping analysis`);

        const analysis = JSON.parse(readFileSync(jsonFilePath, 'utf8'));

        results.push({
          ...analysis,
          analysis_file: jsonFilePath,
          existing_analysis: true,
        });

        videoNames = videoNames.filter((name: string) => name !== videoName);
        continue;
      }
    }

    if (videoNames.length === 0) {
      log('info', `All videos have existing analyses, returning existing results`);
      return results;
    }
  }

  const webApiUrl = process.env.DATAROUTE_API_URL || DATAROUTE_API_URL;
  const authToken = process.env.DATAROUTE_API_TOKEN;

  try {
    log('info', `Calling web API for video analysis: ${webApiUrl}/tools/analyze-videos`);

    if (!authToken) {
      throw new ValidationError('DATAROUTE_API_TOKEN environment variable is required for video analysis via web API');
    }

    const formData = new FormData();

    for (const videoName of videoNames) {
      const videoPath = join(videosDir, videoName);

      if (!existsSync(videoPath)) {
        throw new ValidationError(`Video file not found: ${videoPath}`);
      }

      const videoFile = new File([readFileSync(videoPath)], videoName, {
        type: 'video/mp4'
      });
      formData.append('video_files[]', videoFile);
    }

    if (force) {
      formData.append('force', 'true');
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
        throw new APIError('Video file validation failed. Please check the file format and size.', 422);
      } else if (response.status === 429) {
        throw new APIError('Rate limit exceeded. Please try again later.', 429);
      } else {
        throw new APIError(`Failed to analyze videos via web API: ${errorText}`, response.status);
      }
    }

    const data = await response.json();

    if (!data.success) {
      throw new APIError(`Video analysis failed: ${data.error || 'Unknown error'}`);
    }

    if (!data.analyses || !Array.isArray(data.analyses)) {
      throw new APIError('Invalid response format from web API');
    }

    log('info', `Successfully received ${data.analyses.length} video analyses from web API`);

    const analysisResults = [];

    for (let i = 0; i < data.analyses.length; i++) {
      const analysis = data.analyses[i];
      const videoName = analysis.videoName;
      const jsonFileName = videoName.replace(/\.[^/.]+$/, '.json');
      const jsonFilePath = join(videosDir, jsonFileName);

      try {
        writeFileSync(jsonFilePath, JSON.stringify(analysis, null, 2), 'utf8');

        analysisResults.push({
          ...analysis,
          analysis_file: jsonFilePath,
          existing_analysis: false,
        });

        log('info', `Saved analysis for ${videoName} to ${jsonFilePath}`);
      } catch (error) {
        log('warn', `Failed to save analysis for ${videoName}: ${error}`);

        analysisResults.push({
          ...analysis,
          analysis_file: '',
          existing_analysis: false,
        });
      }
    }

    results.push(...analysisResults);

    log('info', `Successfully analyzed all ${videoNames.length} videos via web API and saved JSON files`);

    return results;
  } catch (error) {
    log('error', `Failed to analyze videos via web API: ${error}`);

    if (error instanceof ValidationError || error instanceof APIError) {
      throw error;
    }

    throw new Error(
      `Failed to analyze videos via web API: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function generateGif(params: GenerateGifParams): Promise<string> {
  const { artifactName, videoName, startTime, endTime } = params;

  log(
    'info',
    `Generating GIF from video ${videoName} in ${artifactName} from ${startTime} to ${endTime}`,
  );

  const workspacePath = getWorkspacePath();
  const artifactDirectory = join(workspacePath, PROJECT_NAME, 'artifacts', artifactName);
  const videosDir = join(artifactDirectory, 'videos');
  const gifsDir = join(artifactDirectory, 'gifs');
  const videoPath = join(videosDir, videoName);

  try {
    if (!existsSync(videoPath)) {
      throw new ValidationError(`Video file not found: ${videoPath}`);
    }

    if (!existsSync(gifsDir)) {
      execSync(`mkdir -p "${gifsDir}"`, { stdio: 'pipe' });
      log('info', `Created gifs directory: ${gifsDir}`);
    }

    const gifName = `${videoName.replace(/\.[^/.]+$/, '')}_${startTime.replace(/:/g, '-')}_to_${endTime.replace(/:/g, '-')}.gif`;
    const gifPath = join(gifsDir, gifName);

    log('info', `Analyzing video properties: ${videoPath}`);

    const probeCommand = `ffprobe -v quiet -print_format json -show_streams "${videoPath}"`;
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
      `Video properties - Width: ${width}, Height: ${height}, Original Frame Rate: ${originalFrameRate} fps`,
    );
    log(
      'info',
      `GIF will be generated at ${gifFrameRate} fps (capped at ${maxGifFrameRate} fps for optimal GIF performance)`,
    );
    log('info', `Creating GIF: ${gifPath}`);

    const paletteCommand = `ffmpeg -ss ${startTime} -to ${endTime} -i "${videoPath}" -vf "fps=${gifFrameRate},scale=${width}:${height}:flags=lanczos,palettegen" -y "${gifPath}.palette.png"`;
    execSync(paletteCommand, { stdio: 'pipe' });

    const gifCommand = `ffmpeg -ss ${startTime} -to ${endTime} -i "${videoPath}" -i "${gifPath}.palette.png" -lavfi "fps=${gifFrameRate},scale=${width}:${height}:flags=lanczos[x];[x][1:v]paletteuse" -y "${gifPath}"`;
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
  videoName: string;
  success: boolean;
  errors: string[];
}[]> {
  const { artifactName, videoNames } = params;

  log('info', `Extracting and enhancing audio from videos in ${artifactName}: ${videoNames.join(', ')}`);

  const workspacePath = getWorkspacePath();
  const artifactDirectory = join(workspacePath, PROJECT_NAME, 'artifacts', artifactName);
  const videosDir = join(artifactDirectory, 'videos');

  const results: {
    videoName: string;
    success: boolean;
    errors: string[];
  }[] = [];

  const tempFiles: string[] = [];

  for (const videoName of videoNames) {
    const videoPath = join(videosDir, videoName);

    if (!existsSync(videoPath)) {
      log('warn', `Video file not found: ${videoPath}, skipping`);
      continue;
    }

    const audioName = `${videoName.replace(/\.[^/.]+$/, '')}.mp3`;
    const audioPath = join(videosDir, audioName);
    const enhancedAudioName = `${videoName.replace(/\.[^/.]+$/, '')}_enhanced.mp3`;
    const enhancedAudioPath = join(videosDir, enhancedAudioName);

    let chunkErrors: Error[] = [];

    try {
      log('info', `Checking if ${videoName} contains audio track`);

      const probeCommand = `ffprobe -v quiet -print_format json -show_streams "${videoPath}"`;
      const probeOutput = execSync(probeCommand, { encoding: 'utf8' });
      const probeData = JSON.parse(probeOutput);

      const audioStream = probeData.streams.find((stream: any) => stream.codec_type === 'audio');
      if (!audioStream) {
        throw new Error(`Video file ${videoName} does not contain an audio track`);
      }

      log('info', `Audio track found in ${videoName}, proceeding with extraction`);
      log('info', `Extracting audio from ${videoName} to ${audioName}`);

      const ffmpegCommand = `ffmpeg -i "${videoPath}" -vn -acodec mp3 -ab 192k -ar 44100 -y "${audioPath}"`;
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
          log('error', `Failed to enhance audio for ${videoName}: ${error}`);
          chunkErrors.push(error as Error);
        }
      } else {
        // Split audio into chunks
        log('info', `Audio is ${totalDuration}s, splitting into ${chunkDuration}s chunks`);

        let chunkIndex = 0;

        for (let startTime = 0; startTime < totalDuration; startTime += chunkDuration) {
          const endTime = Math.min(startTime + chunkDuration, totalDuration);
          const chunkName = `${videoName.replace(/\.[^/.]+$/, '')}_chunk_${chunkIndex}.mp3`;
          const chunkPath = join(videosDir, chunkName);

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
        const concatFileName = `${videoName.replace(/\.[^/.]+$/, '')}_concat.txt`;
        const concatFilePath = join(videosDir, concatFileName);
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

      const enhancedVideoName = `${videoName.replace(/\.[^/.]+$/, '')}_enhanced_audio${videoName.match(/\.[^/.]+$/)?.[0] || '.mp4'}`;
      const enhancedVideoPath = join(videosDir, enhancedVideoName);

      log('info', `Creating enhanced video ${enhancedVideoName} with enhanced audio`);

      const combineCommand = `ffmpeg -i "${videoPath}" -i "${enhancedAudioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest -y "${enhancedVideoPath}"`;
      execSync(combineCommand, { stdio: 'pipe' });

      if (!existsSync(enhancedVideoPath)) {
        throw new Error('Enhanced video file was not created successfully');
      }

      results.push({
        videoName: enhancedVideoName,
        success: true,
        errors: [],
      });

      log('info', `Successfully created enhanced video: ${enhancedVideoPath}`);

      // Add enhanced audio to temp files for cleanup
      tempFiles.push(enhancedAudioPath);
    } catch (error) {
      log('error', `Failed to enhance audio for ${videoName}: ${error}`);

      results.push({
        videoName: videoName,
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
    log('error', `${failedResults.length} videos failed to be enhanced. See the errors for details.`);
  } else {
    log('info', `Successfully created enhanced video files for all videos`);
  }

  return results;
}

export function registerContentGeneratorTools(server: McpServer): void {
  registerTool<AnalyzeVideosParams>(
    server,
    'analyze_videos',
    `Analyzes videos using Gemini API via the web API integration. IMPORTANT: You MUST provide the artifactName, videoNames and force parameters. Example: analyze_videos({ artifactName: 'ARTIFACT_NAME_WITH_TIMESTAMP', videoNames: ['video1.mp4', 'video2.mp4'], force: false })`,
    AnalyzeVideosSchema.shape,
    async (params) => {
      try {
        const videoAnalyses = await analyzeVideos(params);

        const nextSteps = [
          'Review the generated descriptions for each video',
          'Use the descriptions for content creation or documentation',
        ];

        if (videoAnalyses.filter((analysis) => analysis.existing_analysis).length > 0) {
          nextSteps.push(
            'Some videos already have analyses, ask user if they want to force the analysis again',
          );
        }

        const response = {
          success: true,
          message: 'Successfully analyzed videos via web API',
          artifactName: params.artifactName,
          analyses: videoAnalyses,
          existing_analyses:
            videoAnalyses.filter((analysis) => analysis.existing_analysis).length > 0
              ? 'Some videos already have analyses, use the force parameter to force the analysis again'
              : 'All specified videos have new analyses',
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
          `Failed to analyze videos via web API: ${error instanceof Error ? error.message : String(error)}`,
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
    `Generates a GIF from a video. IMPORTANT: You MUST provide the artifactName, videoName, startTime, and endTime parameters. Example: generate_gif({ artifactName: 'NAME_OF_ARTIFACT_DIRECTORY_WITH_TIMESTAMP', videoName: 'NAME_OF_VIDEO_FILE', startTime: '00:00:00', endTime: '00:00:00' })`,
    GenerateGifSchema.shape,
    async (params) => {
      try {
        const gifName = await generateGif(params);

        const response = {
          success: true,
          message: 'Successfully generated GIF',
          gifName: gifName,
          artifactName: params.artifactName,
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
    `Extracts audio from videos using ffmpeg and saves as MP3 files in the same directory. Automatically enhances audio using the web API which integrates with ElevenLabs speech-to-speech conversion with voice ID 29vD33N1CtxCmqQRPOHJ. Requires WEB_API_TOKEN and optionally WEB_API_URL environment variables. IMPORTANT: You MUST provide the artifactName and videoNames parameters. Example: enhance_audio({ artifactName: 'NAME_OF_ARTIFACT_DIRECTORY_WITH_TIMESTAMP', videoNames: ['video1.mp4', 'video2.mp4'] })`,
    EnhanceAudioSchema.shape,
    async (params) => {
      try {
        const result = await enhanceAudio(params);

        const nextSteps = [
          'Review the enhanced video files with improved speech quality',
          'Use the enhanced videos for content creation or analysis',
          'Compare the enhanced videos with the original versions',
        ];

        const response = {
          success: result.every((result) => result.success),
          result: result,
          artifactName: params.artifactName,
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
          `Failed to create enhanced videos: ${error instanceof Error ? error.message : String(error)}`,
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

  registerTool<FetchRedditPostsParams>(
    server,
    'fetch_reddit_posts',
    `Fetches Reddit posts from a specified subreddit using the local DataRoute API. Requires DATAROUTE_API_TOKEN and optionally DATAROUTE_API_URL environment variables. IMPORTANT: You MUST provide the subreddit parameter. Example: fetch_reddit_posts({ subreddit: 'programming', limit: 10, sort: 'top', timePeriod: 'day' })`,
    FetchRedditPostsSchema.shape,
    async (params) => {
      try {
        const result = await fetchRedditPosts(params);

        const response = {
          success: true,
          message: `Successfully fetched ${result.posts.length} posts from r/${params.subreddit}`,
          posts: result.posts,
          meta: result.meta,
          nextSteps: [
            'Review the fetched Reddit posts',
            'Use the post data for content analysis or generation',
            'Consider filtering posts by score, comments, or other criteria',
          ],
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
          `Failed to fetch Reddit posts: ${error instanceof Error ? error.message : String(error)}`,
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
