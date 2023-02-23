import { VoicevoxResultCode } from "./core";

export type VoicevoxResultErrorCodeType = Omit<
  typeof VoicevoxResultCode,
  "VOICEVOX_RESULT_OK"
>;
export type VoicevoxResultErrorCode =
  VoicevoxResultErrorCodeType[keyof VoicevoxResultErrorCodeType];

//voicevox_error_result_to_messageがあるが、エラー作成時にライブラリにアクセスするのは避けたいので、ここで定義している
export const voicevoxResultErrorMessages = {
  [VoicevoxResultCode.VOICEVOX_RESULT_NOT_LOADED_OPENJTALK_DICT_ERROR]:
    "OpenJTalkの辞書が読み込まれていません",
  [VoicevoxResultCode.VOICEVOX_RESULT_LOAD_MODEL_ERROR]:
    "modelデータ読み込みに失敗しました",
  [VoicevoxResultCode.VOICEVOX_RESULT_GET_SUPPORTED_DEVICES_ERROR]:
    "サポートされているデバイス情報取得中にエラーが発生しました",
  [VoicevoxResultCode.VOICEVOX_RESULT_GPU_SUPPORT_ERROR]:
    "GPU機能をサポートすることができません",
  [VoicevoxResultCode.VOICEVOX_RESULT_LOAD_METAS_ERROR]:
    "メタデータ読み込みに失敗しました",
  [VoicevoxResultCode.VOICEVOX_RESULT_UNINITIALIZED_STATUS_ERROR]:
    "Statusが初期化されていません",
  [VoicevoxResultCode.VOICEVOX_RESULT_INVALID_SPEAKER_ID_ERROR]:
    "無効なspeaker_idです",
  [VoicevoxResultCode.VOICEVOX_RESULT_INVALID_MODEL_INDEX_ERROR]:
    "無効なmodel_indexです",
  [VoicevoxResultCode.VOICEVOX_RESULT_INFERENCE_ERROR]: "推論に失敗しました",
  [VoicevoxResultCode.VOICEVOX_RESULT_EXTRACT_FULL_CONTEXT_LABEL_ERROR]:
    " 入力テキストからのフルコンテキストラベル抽出に失敗しました",
  [VoicevoxResultCode.VOICEVOX_RESULT_INVALID_UTF8_INPUT_ERROR]:
    "入力テキストが無効なUTF-8データでした",
  [VoicevoxResultCode.VOICEVOX_RESULT_PARSE_KANA_ERROR]:
    "入力テキストをAquesTalkライクな読み仮名としてパースすることに失敗しました",
  [VoicevoxResultCode.VOICEVOX_RESULT_INVALID_AUDIO_QUERY_ERROR]:
    "無効なaudio_queryです",
} satisfies Record<VoicevoxResultErrorCode, string>;

export const getVoicevoxResultErrorMessage = (resultCode: number): string => {
  if (resultCode in voicevoxResultErrorMessages) {
    return voicevoxResultErrorMessages[resultCode as VoicevoxResultErrorCode];
  }
  return `未知のエラーコードです: ${resultCode}`;
};

export class VoicevoxResultError extends Error {
  public readonly resultCode: VoicevoxResultErrorCode;

  constructor(resultCode: VoicevoxResultErrorCode) {
    super(getVoicevoxResultErrorMessage(resultCode));
    this.resultCode = resultCode;

    this.name = "VoicevoxResultError";
  }
}
