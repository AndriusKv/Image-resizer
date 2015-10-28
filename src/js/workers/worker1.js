/* global importScripts, JSZip, onmessage, postMessage */

importScripts("../libs/jszip.min.js");

var zip = new JSZip(),
    i = 0;

function zipImages(name, uri, type) {
    "use strict";
    
	zip.folder("images").file(name + "." + type, uri, { base64: true });
}

function truncateUri(uri, type) {
    "use strict";
    
    if (type.length === 4) {
        return uri.slice(23);
    }
    else {
        return uri.slice(22);
    }
}

onmessage = function(event) {
    "use strict";
    
	var data = event.data;

	switch (data.action) {
		case "add":
			let image = data.image,
                type = image.type,
                name = image.name,
                uri = truncateUri(image.uri, type);
            
			zipImages(name + i, uri, type);
            i += 1;
			break;
		case "generate":
            i = 0;
            postMessage(zip.generate({type:"blob"}));
			break;
		case "remove":
			zip.remove("images");
			break;
	}
};
