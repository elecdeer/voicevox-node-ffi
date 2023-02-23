import assert from "assert";
import ArrayDi from "ref-array-di";
import ref from "ref-napi";

import {
  createVoicevoxCore,
  VoicevoxAccelerationMode,
  VoicevoxResultCode,
  VoicevoxAudioQueryOptions,
  VoicevoxInitializeOptions,
  VoicevoxSynthesisOptions,
  VoicevoxTtsOptions,
} from "./core";
import { VoicevoxResultError, VoicevoxResultErrorCode } from "./voicevoxError";

const ArrayType = ArrayDi(ref);
const FloatArray = ArrayType(ref.types.float);
const Int64Array = ArrayType(ref.types.int64);

/**
 * Audio query のオプション
 * @param kana aquestalk形式のkanaとしてテキストを解釈する
 */
export type AudioQueryOptions = {
  kana: boolean;
};

/**
 * 初期化オプション
 * @param accelerationMode ハードウェアアクセラレーションモード
 * @param cpuNumThreads CPU利用数を指定 0を指定すると環境に合わせたCPUが利用される
 * @param loadAllModels 全てのモデルを読み込む
 * @param openJtalkDictDir open_jtalkの辞書ディレクトリ
 */
export type InitializeOptions = {
  accelerationMode: "auto" | "cpu" | "gpu";
  cpuNumThreads: number;
  loadAllModels: boolean;
  openJtalkDictDir: string;
};

/**
 * `voicevox_synthesis`のオプション
 * @param enableInterrogativeUpspeak 疑問文の調整を有効にする
 */
export type SynthesisOptions = {
  enableInterrogativeUpspeak: boolean;
};

/**
 * テキスト音声合成オプション
 * @param kana aquestalk形式のkanaとしてテキストを解釈する
 * @param enableInterrogativeUpspeak 疑問文の調整を有効にする
 */
export type TtsOptions = {
  kana: boolean;
  enableInterrogativeUpspeak: boolean;
};

export const createVoicevox = (dylibPath: string) => {
  const core = createVoicevoxCore(dylibPath);
  return {
    audioQuery: async (
      text: string,
      speakerId: number,
      options: AudioQueryOptions
    ): Promise<string> => {
      const resultStrRef = ref.alloc("string");

      await wrapAsync((callback) => {
        core.voicevox_audio_query.async(
          text,
          speakerId,
          VoicevoxAudioQueryOptions({
            kana: options.kana,
          }),
          resultStrRef,
          callback
        );
      });

      const result = resultStrRef.deref();
      assert(result !== null, "audioQuery result is null");

      // 渡しているメモリ領域はNode.js側で確保しているので、GCで解放されるはず？
      // core.voicevox_audio_query_json_free(resultStrRef);

      return result;
    },
    decode: async (
      f0: Buffer,
      phonemeVector: Buffer,
      speakerId: number
    ): Promise<Buffer> => {
      //動作未確認
      const lengthRef = ref.alloc("int");
      const resultRef = ref.alloc("float**");
      const f0Ref = FloatArray(f0);
      const phonemeVectorRef = FloatArray(phonemeVector);

      await wrapAsync((callback) => {
        core.voicevox_decode.async(
          f0Ref.length,
          phonemeVectorRef.length,
          f0Ref,
          phonemeVectorRef,
          speakerId,
          lengthRef,
          resultRef,
          callback
        );
      });

      const length = lengthRef.deref();
      const result = ref.reinterpret(resultRef.deref(), length, 0);

      core.voicevox_decode_data_free(resultRef.deref());
      return result;
    },
    finalize: (): void => {
      core.voicevox_finalize();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getMetas: (): any => {
      const raw = core.voicevox_get_metas_json();
      assert(raw !== null, "getMetas result is null");
      return JSON.parse(raw);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSupportedDevices: (): any => {
      const raw = core.voicevox_get_supported_devices_json();
      assert(raw !== null, "getSupportedDevices result is null");
      return JSON.parse(raw);
    },
    getVersion: (): string => {
      const raw = core.voicevox_get_version();
      assert(raw !== null, "getVersion result is null");
      return raw;
    },
    initialize: async (options: InitializeOptions): Promise<void> => {
      const modeMap = {
        auto: VoicevoxAccelerationMode["VOICEVOX_ACCELERATION_MODE_AUTO"],
        cpu: VoicevoxAccelerationMode["VOICEVOX_ACCELERATION_MODE_CPU"],
        gpu: VoicevoxAccelerationMode["VOICEVOX_ACCELERATION_MODE_GPU"],
      };

      await wrapAsync((callback) => {
        core.voicevox_initialize.async(
          VoicevoxInitializeOptions({
            acceleration_mode: modeMap[options.accelerationMode],
            cpu_num_threads: options.cpuNumThreads,
            load_all_models: options.loadAllModels,
            open_jtalk_dict_dir: options.openJtalkDictDir,
          }),
          callback
        );
      });
    },
    isGpuMode: (): boolean => {
      return core.voicevox_is_gpu_mode();
    },
    isModelLoaded: (speakerId: number): boolean => {
      return core.voicevox_is_model_loaded(speakerId);
    },
    loadModel: async (speakerId: number): Promise<void> => {
      await wrapAsync((callback) => {
        core.voicevox_load_model.async(speakerId, callback);
      });
    },
    makeDefaultAudioQueryOptions: (): AudioQueryOptions => {
      const defaultOptions = core.voicevox_make_default_audio_query_options();
      return {
        kana: defaultOptions.kana,
      };
    },
    makeDefaultInitializeOptions: (): InitializeOptions => {
      const defaultOptions = core.voicevox_make_default_initialize_options();
      const modeMap = {
        [VoicevoxAccelerationMode["VOICEVOX_ACCELERATION_MODE_AUTO"]]: "auto",
        [VoicevoxAccelerationMode["VOICEVOX_ACCELERATION_MODE_CPU"]]: "cpu",
        [VoicevoxAccelerationMode["VOICEVOX_ACCELERATION_MODE_GPU"]]: "gpu",
      } as const;
      assert(
        !(defaultOptions.acceleration_mode in modeMap),
        "invalid acceleration mode"
      );
      const mode = modeMap[defaultOptions.acceleration_mode as 0 | 1 | 2];

      return {
        accelerationMode: mode,
        cpuNumThreads: defaultOptions.cpu_num_threads,
        loadAllModels: defaultOptions.load_all_models,
        openJtalkDictDir: defaultOptions.open_jtalk_dict_dir ?? "",
      };
    },
    makeDefaultSynthesisOptions: (): SynthesisOptions => {
      const defaultOptions = core.voicevox_make_default_synthesis_options();
      return {
        enableInterrogativeUpspeak: defaultOptions.enable_interrogative_upspeak,
      };
    },
    makeDefaultTtsOptions: (): TtsOptions => {
      const defaultOptions = core.voicevox_make_default_tts_options();
      return {
        enableInterrogativeUpspeak: defaultOptions.enable_interrogative_upspeak,
        kana: defaultOptions.kana,
      };
    },
    predictDuration: async (
      phonemeVector: Buffer,
      speakerId: number
    ): Promise<Buffer> => {
      //動作未確認
      const lengthRef = ref.alloc("int");
      const resultRef = ref.alloc("float**");

      await wrapAsync((callback) => {
        core.voicevox_predict_duration.async(
          phonemeVector.length,
          Int64Array(phonemeVector),
          speakerId,
          lengthRef,
          resultRef,
          callback
        );
      });

      const length = lengthRef.deref();
      const result = ref.reinterpret(resultRef.deref(), length, 0);
      core.voicevox_predict_duration_data_free(resultRef.deref());
      return result;
    },
    predictIntonation: async (
      phonemeVector: Buffer,
      consonantLengthVector: Buffer,
      startAccentVector: Buffer,
      endAccentVector: Buffer,
      startAccentPhaseVector: Buffer,
      endAccentPhaseVector: Buffer,
      speakerId: number
    ): Promise<Buffer> => {
      //動作未確認
      const lengthRef = ref.alloc("int");
      const resultRef = ref.alloc("float**");

      assert(
        phonemeVector.length === consonantLengthVector.length &&
          phonemeVector.length === startAccentVector.length &&
          phonemeVector.length === endAccentVector.length &&
          phonemeVector.length === startAccentPhaseVector.length &&
          phonemeVector.length === endAccentPhaseVector.length,
        "The length of the input vectors must be the same."
      );

      await wrapAsync((callback) => {
        core.voicevox_predict_intonation.async(
          phonemeVector.length,
          Int64Array(phonemeVector),
          FloatArray(consonantLengthVector),
          FloatArray(startAccentVector),
          FloatArray(endAccentVector),
          FloatArray(startAccentPhaseVector),
          FloatArray(endAccentPhaseVector),
          speakerId,
          lengthRef,
          resultRef,
          callback
        );
      });

      const length = lengthRef.deref();
      const result = ref.reinterpret(resultRef.deref(), length, 0);
      core.voicevox_predict_intonation_data_free(resultRef.deref());
      return result;
    },
    synthesis: async (
      queryJson: string,
      speakerId: number,
      options: SynthesisOptions
    ): Promise<Buffer> => {
      const lengthRef = ref.alloc("int");
      const resultRef = ref.alloc("float**");

      await wrapAsync((callback) => {
        core.voicevox_synthesis.async(
          queryJson,
          speakerId,
          VoicevoxSynthesisOptions({
            enable_interrogative_upspeak: options.enableInterrogativeUpspeak,
          }),
          lengthRef,
          resultRef,
          callback
        );
      });

      const length = lengthRef.deref();
      const result = ref.reinterpret(resultRef.deref(), length, 0);
      core.voicevox_wav_free(resultRef.deref());
      return result;
    },
    tts: async (
      text: string,
      speakerId: number,
      options: TtsOptions
    ): Promise<Buffer> => {
      const lengthRef = ref.alloc("int");
      const resultRef = ref.alloc("float**");

      await wrapAsync((callback) => {
        core.voicevox_tts.async(
          text,
          speakerId,
          VoicevoxTtsOptions({
            kana: options.kana,
            enable_interrogative_upspeak: options.enableInterrogativeUpspeak,
          }),
          lengthRef,
          resultRef,
          callback
        );
      });

      const length = lengthRef.deref();
      const result = ref.reinterpret(resultRef.deref(), length, 0);
      core.voicevox_wav_free(resultRef.deref());
      return result;
    },
  };
};

type CallbackFn = (err: unknown, resultCode: number) => void;

const wrapAsync = (wrap: (callback: CallbackFn) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    wrap((err, resultCode) => {
      if (err) {
        reject(err);
        return;
      }
      if (resultCode !== VoicevoxResultCode.VOICEVOX_RESULT_OK) {
        reject(new VoicevoxResultError(resultCode as VoicevoxResultErrorCode));
        return;
      }
      resolve();
    });
  });
};
