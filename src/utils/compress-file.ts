import ffmpeg from 'fluent-ffmpeg';

export function compressFile(inputFilePath: string, outputFilePath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .videoCodec('libvpx')
      .audioCodec('libvorbis')
      .outputOptions(['-crf 28', '-b:v 1M'])
      .on('end', () => {
        resolve(null);
      })
      .on('error', (err) => {
        console.error(err);
        reject(err);
      })
      .save(outputFilePath);
  });
}
