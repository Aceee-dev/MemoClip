# MemoClip

MemoClip is a desktop application built with Electron and TypeScript that monitors clipboard content, classifies it (using rule-based or machine learning models), and organizes it into categories such as links and text. Links are further sub-categorized (e.g., study, sports, news). The app runs in the background and provides a modern, green-themed UI for viewing your organized clipboard history.

## Features
- Monitors clipboard content in real-time
- Classifies content as links or text
- Sub-categorizes links (study, sports, news, other)
- Stores clipboard history locally
- Clickable links open in your default browser
- Green-themed, card-like UI
- Menu bar hidden for a clean look
- Ready for ML-based classification integration

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```sh
npm install
```

### Build
```sh
npm run build
```

### Run
```sh
npm start
```

## Integrating Machine Learning
To use a pretrained ML model for classification, set up a Python environment and integrate a Hugging Face model using a Python script. See project issues for guidance.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT

## CI/CD
This project uses GitHub Actions for CI/CD. Each push to the `main` branch will trigger build and test workflows.

---

**Author:** anukul.chand
