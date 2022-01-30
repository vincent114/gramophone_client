
const walk = require('walk');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sanitize = require("sanitize-filename");

const mm = require('music-metadata');
const util = require('util')

const osName = os.platform();
const slashPath = (osName == 'win32') ? "\\" : '/';


// Objects
// ======================================================================================================

// ---
// Indexer
// ---

class Indexer {

	constructor(scope, folders, collectionFiles, collectionCoversPath) {
		this.scope = scope;
		this.folders = folders;
		this.collectionFiles = collectionFiles;
		this.collectionCoversPath = collectionCoversPath;

		this.savedAlbumsCovers = [];
	}

	sleep(milliseconds) {
		var start = new Date().getTime();
		for (var i = 0; i < 1e7; i++) {
			if ((new Date().getTime() - start) > milliseconds) {
				break;
			}
		}
	}

	_sanitizeString(text) {
		text = text.toLowerCase();
		text = text.replace(/ /g, '_');
		text = sanitize(text);
		return text;
	}

	_makeID(field, tags) {

		// Génération d'un ID unique pour la métadonnées passée en paramètres
		// ---

		const self = this;

		let id = null;

		if (field == 'album') {
			id = self._sanitizeString(`${tags.year} ${tags.albumartist} ${tags.album}`);
		}
		if (field == 'artist') {
			id = self._sanitizeString(`${tags.albumartist}`);
		}
		if (field == 'track') {
			const disk = (tags.disk.no) ? `${tags.disk.no}-` : '';
			id = self._sanitizeString(`${tags.year} ${tags.albumartist} ${disk}${tags.track.no} ${tags.title}`);
		}
		if (field == 'year') {
			id = self._sanitizeString(`${tags.year}`);
		}
		if (field == 'genre') {
			const genre = (tags.genre.length > 0) ? tags.genre[0] : 'indetermine';
			id = self._sanitizeString(genre);
		}

		return id;
	}

	processTags(folderRoot, fileFolder, fileName, fileMtime, filePath, tags) {

		// Fouine les tags passés en paramètres à la recherche d'informations manquantes + sauvegarde cover
		// ---

		const self = this;
		const pictures = tags.picture;
		const collectionCoversPath = self.collectionCoversPath;
		const savedAlbumsCovers = self.savedAlbumsCovers;

		delete tags['picture'];

		let processResults = {
			fileOk: true,
			fileFolder: fileFolder,
			fileName: fileName,
			fileMtime: fileMtime,
			filePath: filePath,
			fileTags: tags,
			fileError: '',

			folderRoot: folderRoot,
			coverFile: '',

			albumID: '',
			artistID: '',
			trackID: '',
			yearID: '',
			genreID: '',
		};

		// Titre (obligatoire)
		if (!tags.title) {
			processResults['fileOk'] = false;
			processResults['fileError'] = "Titre non renseigné";
		}

		// Artiste de l'album (obligatoire)
		if (!tags.albumartist) {
			processResults['fileOk'] = false;
			processResults['fileError'] = "Artiste de l'album non renseigné";
		}

		// Album (obligatoire)
		if (!tags.album) {
			processResults['fileOk'] = false;
			processResults['fileError'] = "Nom de l'album non renseigné";
		}

		// Année (obligatoire)
		if (!tags.year) {
			processResults['fileOk'] = false;
			processResults['fileError'] = "Année manquante ou illisible";
		}

		// Création des IDs uniques
		if (processResults.fileOk) {
			processResults['albumID'] = self._makeID('album', tags);
			processResults['artistID'] = self._makeID('artist', tags);
			processResults['trackID'] = self._makeID('track', tags);
			processResults['yearID'] = self._makeID('year', tags);
			processResults['genreID'] = self._makeID('genre', tags);
		}

		// Sauvegarde de la pochette
		if (pictures && pictures.length > 0 && processResults.fileOk) {
			const cover = pictures[0];
			const coverName = self._sanitizeString(`${tags.year} ${tags.albumartist} ${tags.album}`);
			const coverPath = `${collectionCoversPath}${slashPath}${coverName}.jpg`;

			processResults['coverFile'] = coverPath;

			// Enregistrement sur le système de fichier (si pas déjà fait)
			if (savedAlbumsCovers.indexOf(coverName) == -1) {
				fs.open(coverPath, 'w', function(err, fd) {
					if (err) {
						console.error(err);
					} else {
						fs.write(fd, cover.data, 0, cover.data.length, null, function(err) {
							if (err) {
								console.error(err);
							}
							fs.close(fd, function() {
								console.log('wrote the file successfully');
							});
						});
					}
				});
				savedAlbumsCovers.push(coverName);
			}
		}
		return processResults;
	}

	doScan() {

		// Traitement de scan
		// ---

		const self = this;
		const scope = self.scope;
		const folders = self.folders;
		const collectionFiles = self.collectionFiles;

		const options = {
			followLinks: true,
			filters: [".DS_Store"],
		};

		let nbFilesOk = 0;
		let nbFilesReaded = 0;

		// Parcourt des dossiers surveillés
		for (let [folderKey, folder] of Object.entries(folders)) {
			const walker = walk.walk(folder.path, options);

			let walkFinished = false;

			walker.on("file", function (root, fileStats, next) {
				const fileFolder = root;
				const fileName = fileStats.name;
				const filePath = `${fileFolder}${slashPath}${fileName}`;
				const fileExt = (fileName.search('.') == -1) ? '' : fileName.split('.')[fileName.split('.').length - 1].toLowerCase();
				const fileMtime = fileStats.mtime;

				let ignoreFile = false;

				// On ignore les fichiers systèmes ou d'indexation des systèmes d'exploitation
				if (['.ds_store', 'thumbs.db', 'desktop.ini'].indexOf(fileName.toLowerCase()) > -1) {
					ignoreFile = true;
				}

				// On ne s'intéresse qu'aux fichiers MP3
				if (['mp3', 'm4a', 'flac'].indexOf(fileExt) == -1) {
					ignoreFile = true;
				}

				// Scan rapide ? -> on ne s'intéresse qu'aux fichiers qui ont changé depuis le dernier scan
				if (scope == 'quick') {
					if (collectionFiles.hasOwnProperty(filePath)) {
						const collectionFileMtime = new Date(collectionFiles[filePath]);
						if (fileMtime <= collectionFileMtime) {
							ignoreFile = true;
						}
					}
				}

				// Lecture des tags ID3
				if (!ignoreFile) {
					mm.parseFile(filePath, {native: true})
					.then(metadata => {
						nbFilesReaded += 1;

						const tags = metadata.common;
						const processResults = self.processTags(folder.path, fileFolder, fileName, fileMtime.toISOString(), filePath, tags);
						process.send({
							status: 'working',
							processResults: processResults,
						});

						if (walkFinished && nbFilesReaded == nbFilesOk) {
							console.log('FINISHED');
							process.send({
								status: 'done',
							});
						}
					})
					.catch(err => {
						nbFilesReaded += 1;
						console.error(err.message);
					});

					nbFilesOk += 1;
				}

				next();
			});

			walker.on("errors", function (root, nodeStatsArray, next) {
				next();
			});

			walker.on("end", function () {
				walkFinished = true;
				if (nbFilesReaded == nbFilesOk) {
					console.log('FINISHED');
					process.send({
						status: 'done',
					});
				}
			});
		}
	}
}


// Events
// ======================================================================================================

process.on('message', (datas) => {

	const scope = datas.scope;
	const folders = datas.folders;
	const collectionFiles = datas.collectionFiles;
	const collectionCoversPath = datas.collectionCoversPath;

	const indexer = new Indexer(scope, folders, collectionFiles, collectionCoversPath);
	indexer.doScan();
});
