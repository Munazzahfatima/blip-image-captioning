# 🖼️ BLIP Image Captioning

An AI-powered image captioning web app built with **Salesforce BLIP** (ViT-B/16 + BERT decoder), **FastAPI**, and **React**.

Upload any image and get a natural language description — instantly. Supports both unconditional captioning and prompt-guided (conditional) captioning.

---

## ✨ Features

- 🔍 **Unconditional captioning** — BLIP freely describes the image
- 💬 **Conditional captioning** — guide the output with a text prompt (e.g. `"a photo of"`)
- ⚡ **Typewriter animation** on generated captions
- 🕓 **Caption history** — keeps the last 6 results with thumbnails
- 🖱️ **Drag & drop** image upload (JPG, PNG, WEBP)
- 🧠 **Architecture panel** — explains ViT → Cross-Attention → BERT pipeline in the UI

---

## 🏗️ Architecture

```
Image → ViT-B/16 Encoder → Patch Embeddings
                                    ↓
              Prompt (optional) → Cross-Attention
                                    ↓
                         BERT-based Text Decoder
                                    ↓
                          Natural Language Caption
```

| Component | Detail |
|---|---|
| Model | `Salesforce/blip-image-captioning-base` |
| Image Encoder | ViT-B/16 (16×16 patch embeddings) |
| Text Decoder | BERT-based language model |
| Decoding | Beam search · n=5 · max 50 tokens |
| Backend | FastAPI + Uvicorn |
| Frontend | React 18 |

---

## 📁 Project Structure

```
├── backend/
│   ├── app.py           # FastAPI server & /caption endpoint
│   ├── model.py         # BLIP model loading & inference
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── BLIPAnalyzer.jsx  # Main UI component
│       └── App.css
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/Munazzahfatima/blip-image-captioning
cd blip-image-captioning
```

---

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

> **Note:** On first run, BLIP (~1 GB) will be downloaded automatically from Hugging Face.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## 🔌 API Reference

### `POST /caption`

Generate a caption for an uploaded image.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `image` | file | ✅ | Image file (JPG, PNG, WEBP) |
| `prompt` | string | ❌ | Optional text prompt to condition the caption |

**Response**

```json
{
  "caption": "a dog sitting on a wooden floor",
  "prompt": null,
  "mode": "unconditional",
  "model": "Salesforce/blip-image-captioning-base",
  "encoder": "ViT-B/16",
  "decoder": "BERT-based text decoder"
}
```

## 🖥️ Screenshots
"Webpage"
<img width="985" height="692" alt="Screenshot 2026-06-12 193619" src="https://github.com/user-attachments/assets/85758940-a0dc-4a49-b823-92518ada4ce1" />
"General - Unconditional"
<img width="1252" height="751" alt="Screenshot 2026-06-12 193511" src="https://github.com/user-attachments/assets/fb42c61f-d684-41d4-b69b-0a29412e8ede" />
"with condition:
<img width="1102" height="758" alt="Screenshot 2026-06-12 193255" src="https://github.com/user-attachments/assets/299911f4-3982-44b0-8842-78296d001089" />

<img width="952" height="677" alt="Screenshot 2026-06-12 193417" src="https://github.com/user-attachments/assets/94beb08e-8438-4a8c-abd4-3043a245c716" />


---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| AI Model | Salesforce BLIP (`transformers`) |
| Backend | FastAPI, Uvicorn, PyTorch, Pillow |
| Frontend | React 18, Outfit + Cormorant Garamond fonts |
| Styling | Inline CSS with CSS animations |

---

## Dependencies

### Backend (`requirements.txt`)
```
fastapi==0.104.1
uvicorn==0.24.0
torch==2.1.0
transformers==4.35.0
pillow==10.1.0
python-multipart==0.0.6
```

### Frontend (`package.json`)
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-scripts` 5.0.1

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgements

- [Salesforce BLIP](https://github.com/salesforce/BLIP) — the underlying vision-language model
- [Hugging Face Transformers](https://huggingface.co/Salesforce/blip-image-captioning-base) — model hosting & inference API
- [FastAPI](https://fastapi.tiangolo.com/) — backend framework
