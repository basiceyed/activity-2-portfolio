const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directory exists
const publicDir = path.join(__dirname, 'public');
const uploadDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config: keep original extension, unique filename
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
		const unique = Date.now();
		cb(null, `${base}_${unique}${ext}`);
	}
});

const upload = multer({ storage });

// (Static files are registered after the dynamic home route below)

// Simple admin upload form (kept separate to avoid changing portfolio HTML)
app.get('/admin', (req, res) => {
	res.send(`<!doctype html>
	<html lang="en">
	<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Upload Image</title>
	<style>body{font-family:Arial, sans-serif; padding:24px; max-width:720px; margin:0 auto} form{display:flex; gap:12px; align-items:center} .note{margin-top:16px; color:#555}</style>
	</head>
	<body>
	<h1>Upload portfolio image</h1>
	<form action="/upload" method="post" enctype="multipart/form-data">
		<label>Target:
			<select name="target">
				<option value="hero" selected>Hero image (portrait)</option>
			</select>
		</label>
		<input type="file" name="image" accept="image/*" required />
		<button type="submit">Upload</button>
	</form>
	<p class="note">After upload, the site will reference the new image path automatically.</p>
	<p><a href="/">Back to site</a></p>
	</body>
	</html>`);
});

// Persist last uploaded paths
const dataFile = path.join(__dirname, 'data', 'images.json');
function readImageMap() {
	try {
		const content = fs.readFileSync(dataFile, 'utf-8');
		return JSON.parse(content);
	} catch (e) {
		return {};
	}
}

function writeImageMap(map) {
	const dataDir = path.dirname(dataFile);
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	fs.writeFileSync(dataFile, JSON.stringify(map, null, 2));
}

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
	const target = (req.body.target || 'hero').toString();
	if (!req.file) {
		return res.status(400).send('No file uploaded');
	}
	const webPath = `/uploads/${req.file.filename}`;
	const map = readImageMap();
	map[target] = webPath;
	writeImageMap(map);
	res.redirect('/');
});

// Serve index with dynamic image substitution without changing source HTML file on disk
app.get('/', (req, res, next) => {
	const indexPath = path.join(publicDir, 'index.html');
	fs.readFile(indexPath, 'utf-8', (err, html) => {
		if (err) return next(err);
		const map = readImageMap();
		let output = html;
		if (map.hero) {
			// Replace only the hero image src attribute value
			output = output.replace(/(<div class="hero-right">\s*<img\s+src=")([^"]+)("[^>]*>)/m, `$1${map.hero}$3`);
		}
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.send(output);
	});
});

// Serve static files AFTER dynamic '/' so replacements take effect
app.use(express.static(publicDir));

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

