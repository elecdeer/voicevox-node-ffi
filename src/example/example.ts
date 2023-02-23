import * as fs from "fs";

import { createVoicevox } from "../voicevox";

const voicevox = createVoicevox("voicevox_core/libvoicevox_core.dylib");

await voicevox.initialize({
  accelerationMode: "auto",
  cpuNumThreads: 0,
  loadAllModels: false,
  openJtalkDictDir: "voicevox_core/open_jtalk_dic_utf_8-1.11",
});

console.log(`version: ${voicevox.getVersion()}`);
console.log(`meta`, voicevox.getMetas());

const modelId = 14;

console.log(`load model: ${modelId}`);
await voicevox.loadModel(modelId);
console.log(`loaded model: ${modelId}`);

const testTask = async (text: string, fileName: string) => {
  console.time("test");
  const queryStr = await voicevox.audioQuery(text, modelId, {
    kana: false,
  });
  console.log(`query`, JSON.parse(queryStr));

  console.timeLog("test");

  const synthesisResult = await voicevox.synthesis(queryStr, modelId, {
    enableInterrogativeUpspeak: false,
  });
  console.log(`synthesisResult: ${synthesisResult.length} bytes`);

  console.timeLog("test");
  fs.writeFileSync(fileName, synthesisResult);
  console.timeEnd("test");
};

await testTask(
  "新設診察室視察、瀕死の死者、生産者の申請書審査、行政観察査察使、親切な先生、在社必死の失踪",
  "./audioResult/hayakuchi.wav"
);

console.log(process.memoryUsage());
voicevox.finalize();

console.log("finish");
