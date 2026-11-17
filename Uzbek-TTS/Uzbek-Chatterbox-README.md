---
license: mit
language:
- uz
base_model: ResembleAI/chatterbox
library_name: chatterbox-tts
pipeline_tag: text-to-speech
tags:
- uzbek
- tts
- text-to-speech
- chatterbox
- lora
- voice-cloning
- turkic-languages
- low-resource
datasets:
- murodbek/uzbek-speech-corpus
papers:
- 10.5281/zenodo.22099686
---

# Uzbek TTS — Chatterbox LoRA

**Paper:** [Adapting Chatterbox TTS to Uzbek via LoRA: An Open Recipe and Three Documented Pitfalls](https://doi.org/10.5281/zenodo.22099686) (Zenodo preprint, 2026)

A LoRA fine-tune of [ResembleAI/chatterbox](https://huggingface.co/ResembleAI/chatterbox)
for Uzbek (Latin script), trained on 111 hours of permissively-licensed multi-speaker
speech. Everything about the training — including what went wrong — is documented.

**The short version:** the model speaks intelligible Uzbek with good coverage of oʻ, gʻ,
q, and x. It is not as naturally fluent as Sayro out of the box, but it is open, it runs
on CPU, and every design decision and failure mode behind it is written down for whoever
trains the next Turkic language.

## Demo samples

All demos use the final adapter with ASCII-normalized input text:

**Assalomu alaykum, bugun havo juda ham chiroyli.** (male reference voice)

<audio controls src="https://huggingface.co/UAzimov/Uzbek-tts-chatterbox/resolve/main/samples/demo_01_assalomu_alaykum.wav"></audio>

**Kitob o'qish insonning dunyoqarashini kengaytiradi va lug'at boyligini oshiradi.** (female reference voice)

<audio controls src="https://huggingface.co/UAzimov/Uzbek-tts-chatterbox/resolve/main/samples/demo_04_kitob_oqish_female.wav"></audio>

**G'azablangan odam bilan bahslashishning foydasi yo'q, deb o'ylayman.** (female reference voice)

<audio controls src="https://huggingface.co/UAzimov/Uzbek-tts-chatterbox/resolve/main/samples/demo_06_gazablangan_female.wav"></audio>

More comparison samples (including baselines) live in `mos_eval/`.

## Quickstart

```python
# 1. Clone the finetuning toolkit at the pinned commit
git clone https://github.com/gokhaneraslan/chatterbox-finetuning
cd chatterbox-finetuning
python setup.py   # downloads base model files to ./pretrained_models/

# 2. Load base + this adapter
import sys; sys.path.insert(0, ".")
from src.config import TrainConfig
from src.chatterbox_.tts import ChatterboxTTS
from src.model import resize_and_load_t3_weights
from src.chatterbox_.models.t3.t3 import T3
from peft import LoraConfig, get_peft_model
import torch, re

cfg = TrainConfig()  # defaults match training config
eng = ChatterboxTTS.from_local(cfg.model_dir, device="cpu")
hp = eng.t3.hp; hp.text_tokens_dict_size = cfg.new_vocab_size
new_t3 = resize_and_load_t3_weights(T3(hp=hp), eng.t3.state_dict())
peft_cfg = LoraConfig(r=128, lora_alpha=256,
    target_modules=["q_proj","k_proj","v_proj","o_proj",
                    "gate_proj","up_proj","down_proj","spkr_enc"],
    lora_dropout=0.05, bias="none",
    modules_to_save=["text_emb","text_head"])
model = get_peft_model(new_t3, peft_cfg)

# 3. Load adapter weights (see docs/ADAPTER_RECONSTRUCTION.md for details)
sd = torch.load("adapter_model.safetensors", weights_only=True)
missing, unexpected = model.load_state_dict(sd, strict=False)
assert len(missing) == 0, f"missing keys: {missing}"

# 4. IMPORTANT: normalize text before inference
def normalize(text):
    # all apostrophe variants -> ASCII ' (matches training distribution)
    return re.sub("[\u02bb\u02bc\u2018\u2019`]", "'", text)

wav = model.generate(normalize("Assalomu alaykum!"))
```

Full step-by-step recipe in [`docs/ADAPTER_RECONSTRUCTION.md`](docs/ADAPTER_RECONSTRUCTION.md).
Environment pins in [`docs/pip_freeze.txt`](docs/pip_freeze.txt) — torch/peft/transformers
versions matter.

## Important: text normalization

Two things will make output sound wrong if you skip them:

1. **Apostrophes must be ASCII `'`.** The training data used ASCII apostrophes ~200x more
   often than the proper okina `ʻ` (U+02BB). Sending okina text puts the model off its
   training distribution and degrades oʻ/gʻ pronunciation.
2. **Numbers should be spelled out.** Like every other open Uzbek TTS we tested, this model
   does not verbalize digits ("1991-yil" comes out as English "nineteen ninety-one"). Use
   [`scripts/uz_normalize.py`](scripts/uz_normalize.py) to convert numbers to Uzbek words
   first:

```python
from uz_normalize import normalize_uz
text = normalize_uz("1991-yil 31-avgustda soat 9 da")
# "bir ming to'qqiz yuz to'qson bir yil o'ttiz birinchi avgustda soat to'qqiz da"
```

With both applied, number-heavy sentences work fine.

## Training details

| | |
|---|---|
| Base model | ResembleAI/chatterbox (multilingual, NOT turbo) |
| Method | LoRA r=128, α=256, dropout 0.05 |
| Target modules | q/k/v/o_proj, gate/up/down_proj, spkr_enc |
| Fully trained | text_emb + text_head (absorbs 1,750 new tokens) |
| Trainable params | 95.6M / 631.6M (15.1%) |
| Data | 111h / 108,745 clips, multi-speaker, public (CC-BY / CC-0 / Apache-2.0) |
| Batch | 8 × grad_accum 4, lr 1e-4 |
| Duration | 10 epochs / 33,980 steps @ 1.19 s/step on one RTX 5090 |

### What's in this repo

```
├── adapter_model.safetensors      # final checkpoint (epoch 10) - recommended
├── adapter_config.json            # PEFT config for the final adapter
├── checkpoints/                   # earlier checkpoints, kept for comparison
│   ├── ckpt-10500-adapter/        # epoch 3
│   ├── ckpt-19500-adapter/        # epoch ~5.7
│   ├── ckpt-20000-adapter/        # epoch ~5.9
│   ├── ckpt-25000-adapter/        # epoch ~7.4
│   └── ckpt-32000-adapter/        # epoch ~9.4
├── samples/                       # demo audio
├── mos_eval/                      # blind comparison set vs baselines
├── scripts/uz_normalize.py        # number/text normalizer
└── docs/                          # reconstruction recipe + env pins
```

### Checkpoint notes

Blind listening showed checkpoints from ~epoch 6 onward are practically
indistinguishable — loss kept dropping but audible quality plateaued. The final
checkpoint is recommended simply because it's the most converged; earlier ones exist in
case you want to compare or continue training from a different point.

## Honest limitations

- **Naturalness**: Sayro ([uzlm/sayro-tts-1.7B](https://huggingface.co/uzlm/sayro-tts-1.7B))
  still leads on naturalness. Their team had more data curation and a bigger model; this
  project had a rented 5090 and ten epochs.
- **Phoneme strengths differ**: our models handle q/x/gʻ gutturals better than
  Turkish-prior systems do, but have less overall fluency.
- **Start-of-clip noise**: occasional artifacts in the first fraction of a second.
  Trimming the first 200 ms of output helps if it bothers you.
- **No formal MOS yet**: evaluation was structured blind listening by the author
  (70 samples, 10 sentences, shuffled). Controlled MOS with multiple listeners is planned.

## Comparison with existing systems

| System | Base | Speakers | Open? | Digits? |
|---|---|---|---|---|
| **This repo** | Chatterbox | multi | ✅ MIT | via normalizer |
| [Sayro](https://huggingface.co/uzlm/sayro-tts-1.7B) | Qwen3-TTS 1.7B | multi | gated terms | ✅ built-in |
| [Abduqayum/uzbek-tts-natural-speech-chatterbox](https://huggingface.co/Abduqayum/uzbek-tts-natural-speech-chatterbox) | Chatterbox | single | ✅ | ❌ |
| [AbrorBalxiyev/uzbek-tts-model](https://huggingface.co/AbrorBalxiyev/uzbek-tts-model) | SpeechT5 | ? | ✅ | ❌ |
| Meta MMS uzb-cyrl | VITS | n/a | ✅ CC-BY-NC | Cyrillic only |

Credit where due: **Abduqayum's published recipe** is what this training started from —
the LoRA configuration and general approach are his, adjusted for multi-speaker data.
**Sayro (uzlm lab)** set the quality bar this project measured itself against and showed
that proper digit normalization matters more than any amount of fine-tuning. Both are
worth using depending on your needs.

## Data credits

Trained exclusively on permissively-licensed public speech:

- [murodbek/uzbek-speech-corpus](https://huggingface.co/datasets/murodbek/uzbek-speech-corpus) (USC, 105h, CC-BY-4.0)
- Mozilla Common Voice — Uzbek (CC-0)
- islomov YouTube-derived collections (Apache-2.0)

Thanks to the dataset maintainers — the unglamorous work everything here sits on.

## License

MIT, inherited from the base model. Voice-cloning capability is inherent to Chatterbox
and unchanged by this adaptation — get consent before cloning identifiable voices.

## Reproducibility

From a clean machine, ~20 minutes:
1. Clone toolkit at pinned commit → `setup.py`
2. Download this adapter
3. Follow `docs/ADAPTER_RECONSTRUCTION.md`

Environment pins (`docs/pip_freeze.txt`, 119 packages) ensure torch/peft/transformers
compatibility.

## Citation

If you use this model, please cite the paper:

```bibtex
@misc{azimov2026uzbek_tts,
  author       = {Azimov, Utkirbek},
  title        = {Adapting Chatterbox TTS to Uzbek via LoRA:
                  An Open Recipe and Three Documented Pitfalls},
  year         = 2026,
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.22099686},
  url          = {https://doi.org/10.5281/zenodo.22099686}
}
```
