import { Library } from "ffi-napi";
import * as fs from "fs";
import ref from "ref-napi";
import Struct from "ref-struct-di";

const StructType = Struct(ref);

console.log("Hello World!");

const VoicevoxInitializeOptions = StructType({
  acceleration_mode: ref.types.int32,
  cpu_num_threads: ref.types.int16,
  load_all_models: ref.types.bool,
  open_jtalk_dict_dir: ref.types.CString,
});

const VoicevoxAudioQueryOptions = StructType({
  kana: ref.types.bool,
});

const VoicevoxSynthesisOptions = StructType({
  enable_interrogative_upspeak: ref.types.bool,
});

const voicevox = Library("voicevox_core/libvoicevox_core.dylib", {
  voicevox_get_version: ["string", []],
  voicevox_initialize: ["int", [VoicevoxInitializeOptions]],
  voicevox_load_model: ["int", ["int"]],
  voicevox_audio_query: [
    "int",
    ["string", "int", VoicevoxAudioQueryOptions, ref.refType("string")],
  ],
  voicevox_synthesis: [
    "int",
    [
      "string",
      "int",
      VoicevoxSynthesisOptions,
      ref.refType("uint"),
      ref.refType("uint8*"),
    ],
  ],
  voicevox_wav_free: ["void", ["pointer"]],
});

console.log(voicevox.voicevox_get_version());

console.log(
  voicevox.voicevox_initialize(
    VoicevoxInitializeOptions({
      acceleration_mode: 0,
      cpu_num_threads: 0,
      load_all_models: false,
      open_jtalk_dict_dir: "voicevox_core/open_jtalk_dic_utf_8-1.11",
    })
  )
);

console.log(voicevox.voicevox_load_model(0));

const synthesis = (text: string, fileName: string) => {
  const outString = ref.alloc("string");
  console.log(
    voicevox.voicevox_audio_query(
      text,
      0,
      VoicevoxAudioQueryOptions({ kana: false }),
      outString
    )
  );
  const queryResult = outString.deref();
  console.log(queryResult);

  const outSize = ref.alloc("uint");
  const outBuffer = ref.alloc("uint8**");

  console.log(
    voicevox.voicevox_synthesis(
      queryResult,
      0,
      VoicevoxSynthesisOptions({ enable_interrogative_upspeak: false }),
      outSize,
      outBuffer
    )
  );

  const size = outSize.deref();
  console.log(`size: ${size}`);

  console.log(outBuffer.deref());

  const buffer = ref.reinterpret(outBuffer.deref(), size, 0);
  console.log(buffer);

  console.log(`free: ${voicevox.voicevox_wav_free(outBuffer.deref())}`);

  console.time("write");
  fs.writeFileSync(fileName, buffer);
  console.timeEnd("write");
};

synthesis("こんにちは", "test.wav");
synthesis("こんばんわ", "test2.wav");

console.time("test3");
synthesis("ディープラーニングは、万能薬ではありません。", "test3.wav");
console.timeEnd("test3");
