from faster_whisper import WhisperModel
import json
import sys

arguments = sys.argv

source = arguments[1]

model_size = "large-v3"

model = WhisperModel(model_size, device="cpu", compute_type="int8")
#model = WhisperModel(model_size, device="cuda", compute_type="float16")

segments, info = model.transcribe(source, beam_size=5)

segment_list = [
    {
        "start": segment.start,
        "end": segment.end,
        "text": segment.text
    }
    for segment in segments
]

json_output = json.dumps(segment_list, indent=2, ensure_ascii=False)

print(json_output)
