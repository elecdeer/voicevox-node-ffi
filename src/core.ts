import { Library } from "ffi-napi";
import * as fs from "fs";
import ArrayDi from "ref-array-di";
import ref from "ref-napi";
import StructDi from "ref-struct-di";

const StructType = StructDi(ref);
const ArrayType = ArrayDi(ref);

export const VoicevoxResultCode = {
  /** 成功 */
  VOICEVOX_RESULT_OK: 0,
  /** open_jtalk辞書ファイルが読み込まれていない */
  VOICEVOX_RESULT_NOT_LOADED_OPENJTALK_DICT_ERROR: 1,
  /** modelの読み込みに失敗した */
  VOICEVOX_RESULT_LOAD_MODEL_ERROR: 2,
  /** サポートされているデバイス情報取得に失敗した */
  VOICEVOX_RESULT_GET_SUPPORTED_DEVICES_ERROR: 3,
  /** GPUモードがサポートされていない */
  VOICEVOX_RESULT_GPU_SUPPORT_ERROR: 4,
  /** メタ情報読み込みに失敗した */
  VOICEVOX_RESULT_LOAD_METAS_ERROR: 5,
  /** ステータスが初期化されていない */
  VOICEVOX_RESULT_UNINITIALIZED_STATUS_ERROR: 6,
  /** 無効なspeaker_idが指定された */
  VOICEVOX_RESULT_INVALID_SPEAKER_ID_ERROR: 7,
  /** 無効なmodel_indexが指定された */
  VOICEVOX_RESULT_INVALID_MODEL_INDEX_ERROR: 8,
  /** 推論に失敗した */
  VOICEVOX_RESULT_INFERENCE_ERROR: 9,
  /** コンテキストラベル出力に失敗した */
  VOICEVOX_RESULT_EXTRACT_FULL_CONTEXT_LABEL_ERROR: 10,
  /** 無効なutf8文字列が入力された */
  VOICEVOX_RESULT_INVALID_UTF8_INPUT_ERROR: 11,
  /** aquestalk形式のテキストの解析に失敗した */
  VOICEVOX_RESULT_PARSE_KANA_ERROR: 12,
  /** 無効なAudioQuery */
  VOICEVOX_RESULT_INVALID_AUDIO_QUERY_ERROR: 13,
} as const;

export const VoicevoxAccelerationMode = {
  /** 実行環境に合った適切なハードウェアアクセラレーションモードを選択する */
  VOICEVOX_ACCELERATION_MODE_AUTO: 0,
  /** ハードウェアアクセラレーションモードを"CPU"に設定する */
  VOICEVOX_ACCELERATION_MODE_CPU: 1,
  /** ハードウェアアクセラレーションモードを"GPU"に設定する */
  VOICEVOX_ACCELERATION_MODE_GPU: 2,
} as const;

export const VoicevoxAudioQueryOptions = StructType({
  kana: ref.types.bool,
});

export const VoicevoxInitializeOptions = StructType({
  acceleration_mode: ref.types.int,
  cpu_num_threads: ref.types.int16,
  load_all_models: ref.types.bool,
  open_jtalk_dict_dir: ref.types.CString,
});

export const VoicevoxSynthesisOptions = StructType({
  enable_interrogative_upspeak: ref.types.bool,
});

export const VoicevoxTtsOptions = StructType({
  kana: ref.types.bool,
  enable_interrogative_upspeak: ref.types.bool,
});

export const createVoicevoxCore = (dylibPath: string) => {
  // ファイルの実在を確認
  if (!fs.existsSync(dylibPath)) {
    throw new Error(`Library file not found: ${dylibPath}`);
  }

  return Library(dylibPath, {
    voicevox_audio_query: [
      "int",
      ["string", "uint32", VoicevoxAudioQueryOptions, ref.refType("string")],
    ],
    voicevox_audio_query_json_free: ["void", ["void*"]],
    voicevox_decode: [
      "int",
      [
        "uint32",
        "uint32",
        ArrayType("float"),
        ArrayType("float"),
        "uint32",
        ref.refType("uint"),
        ref.refType("float*"),
      ],
    ],
    voicevox_decode_data_free: ["void", ["float*"]],
    voicevox_error_result_to_message: ["string", ["int"]],
    voicevox_finalize: ["void", []],
    voicevox_get_metas_json: ["string", []],
    voicevox_get_supported_devices_json: ["string", []],
    voicevox_get_version: ["string", []],
    voicevox_initialize: ["int", [VoicevoxInitializeOptions]],
    voicevox_is_gpu_mode: ["bool", []],
    voicevox_is_model_loaded: ["bool", ["uint32"]],
    voicevox_load_model: ["int", ["uint32"]],
    voicevox_make_default_audio_query_options: [VoicevoxAudioQueryOptions, []],
    voicevox_make_default_initialize_options: [VoicevoxInitializeOptions, []],
    voicevox_make_default_synthesis_options: [VoicevoxSynthesisOptions, []],
    voicevox_make_default_tts_options: [VoicevoxTtsOptions, []],
    voicevox_predict_duration: [
      "int",
      [
        "uint32",
        ArrayType("int64"),
        "uint32",
        ref.refType("uint"),
        ref.refType("float*"),
      ],
    ],
    voicevox_predict_duration_data_free: ["void", ["float*"]],
    voicevox_predict_intonation: [
      "int",
      [
        "uint32",
        ArrayType("int64"),
        ArrayType("int64"),
        ArrayType("int64"),
        ArrayType("int64"),
        ArrayType("int64"),
        ArrayType("int64"),
        "uint32",
        ref.refType("uint"),
        ref.refType("float*"),
      ],
    ],
    voicevox_predict_intonation_data_free: ["void", ["float*"]],
    voicevox_synthesis: [
      "int",
      [
        "string",
        "uint32",
        VoicevoxSynthesisOptions,
        ref.refType("uint"),
        ref.refType("uint8*"),
      ],
    ],
    voicevox_tts: [
      "int",
      [
        "string",
        "uint32",
        VoicevoxTtsOptions,
        ref.refType("uint"),
        ref.refType("uint8*"),
      ],
    ],
    voicevox_wav_free: ["void", ["void*"]],
  });
};
