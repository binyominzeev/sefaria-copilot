# Sefaria Copilot - Torah Text Editor

A sophisticated rich text editor designed specifically for Torah articles, featuring AI-powered source detection and seamless Sefaria integration.

## Features

### 🎯 Core Features
- **Rich Text Editor**: Full-featured text editor with Torah-appropriate formatting
- **AI Source Detection**: Automatically detects Torah, Talmud, and other Jewish sources as you type
- **Sefaria Integration**: Real-time source suggestions from the Sefaria database
- **Smart Autocomplete**: Contextual source recommendations based on your writing
- **Hebrew Support**: Full Hebrew text support with proper RTL rendering

### 📚 Source Recognition
The editor recognizes various source formats:
- **Torah**: "Genesis 1:1", "Bereishit 1:1"
- **Talmud**: "Berakhot 2a", "Shabbat 31b"
- **Mishnah**: "Mishnah Avot 1:1", "Mishna Berakhot 1:1"
- **Commentaries**: "Rashi on Genesis 1:1", "Tosafot on Berakhot 2a"
- **Hebrew Sources**: "ברכות ב׳ א׳", "שבת ל״א ב׳"

### 🎨 User Interface
- **Left Source Panel**: Tabbed interface showing detected sources by category
- **Confidence Scoring**: Visual indicators for source detection accuracy
- **One-Click Insertion**: Easy source reference insertion
- **Sefaria Links**: Direct links to sources on Sefaria.org
- **Modern Design**: Clean, scholarly interface optimized for Torah study

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sefaria-copilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Basic Writing
1. Start typing your Torah article in the main editor
2. Use the toolbar for formatting (bold, italic, headers, quotes)
3. The editor supports both English and Hebrew text

### Source Detection
1. Type source references like "Genesis 1:1" or "Berakhot 2a"
2. Watch as the left panel populates with relevant Sefaria sources
3. Sources are categorized (Torah, Talmud, Mishnah, etc.)
4. Confidence scores help you identify the best matches

### Working with Sources
1. **Browse**: Click through different source categories in the left panel
2. **Preview**: Click on any source to see more details
3. **Insert**: Use the "Insert" button to add source references to your text
4. **Copy**: Copy source text to clipboard
5. **External**: Open sources directly on Sefaria.org

### Keyboard Shortcuts
- `Ctrl/Cmd + B`: Bold text
- `Ctrl/Cmd + I`: Italic text
- `Ctrl/Cmd + S`: Save document (planned feature)

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety throughout the application
- **TipTap**: Extensible rich text editor built on ProseMirror
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### APIs & Services
- **Sefaria API**: Real-time access to Jewish texts and sources
- **Custom Source Detection**: Pattern-matching algorithms for reference recognition
- **Caching Layer**: Intelligent caching to minimize API calls

### Features
- **Debounced Analysis**: Efficient text analysis to prevent excessive API calls
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Accessibility**: WCAG-compliant interface with proper ARIA labels

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── TorahEditor.tsx  # Main rich text editor
│   └── SourcePanel.tsx  # Left sidebar with sources
├── services/           # API and business logic
│   └── sefariaApi.ts   # Sefaria API integration
├── types/              # TypeScript type definitions
│   └── sefaria.ts      # Source and API types
├── utils/              # Utility functions
│   └── debounce.ts     # Performance utilities
└── App.tsx             # Main application component
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Planned Features
- [ ] Document saving and loading
- [ ] Export to PDF/Word formats
- [ ] Collaborative editing
- [ ] Advanced search within sources
- [ ] Custom source libraries
- [ ] Offline mode with cached sources
- [ ] Mobile app version

### Enhancement Ideas
- [ ] AI-powered writing suggestions
- [ ] Automatic citation formatting
- [ ] Integration with other Jewish text databases
- [ ] Multi-language support (French, Spanish, etc.)
- [ ] Voice-to-text input with Hebrew support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Sefaria**: For providing the comprehensive Jewish texts API
- **TipTap**: For the excellent rich text editing framework
- **The Jewish Community**: For inspiring this tool to enhance Torah study and writing

## Support

For support, questions, or feature requests:
- Open an issue on GitHub
- Contact the development team
- Join our community discussions

---

*Built with ❤️ for the Torah learning community*
