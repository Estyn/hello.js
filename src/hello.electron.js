// Electron override for hello.electron.js

// Script to support Electron
// Is this a Electron app?  always for us

if (window.navigator.userAgent.indexOf("Electron") != -1) {
	(function () {
		// Swap the popup method
		hello.utils.popup = _open

		function _open(url, redirectUri, options) {
			var electron = window.require('electron');
			var remote = electron.remote;
			var BrowserWindow = remote.BrowserWindow;

			var authWindow = new BrowserWindow({

				show: false,
				modal: true,
				minimizable: false,
				useContentSize: true,
				webPreferences: {
					nodeIntegration: false
				}
			});

			if (options.resizable === 0)
				authWindow.resizable = false; // Default is true

			// Set the size only if it's not the default
			if (options.height != 550 || options.width != 500) {
				authWindow.height = options.height;
				authWindow.width = options.width
			}

			authWindow.loadURL(url);
			authWindow.once('ready-to-show', () => {
				authWindow.show()
			})

			function handleCallback(callBackUrl) {
				var a = hello.utils.url(callBackUrl);
				var _popup = {
					location: {
						search: a.search,
						hash: a.hash,
						href: a.href
					},
					close: function () {
						authWindow.destroy();
					}
				};

				var result = hello.utils.responseHandler(_popup, window);
			}
			authWindow.on('close', function () {
				authWindow.destroy();
			});

			authWindow.webContents.on('will-navigate', function (event, url) {
				handleCallback(url);
			});

			authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
				handleCallback(newUrl);
			});

			return authWindow;
		}
	})();
}

