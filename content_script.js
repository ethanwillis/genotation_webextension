/*
	Description: Content script that is injected on each page loaded in the browser. When a message is sent to this script, this script converts the entire webpage
	into a JSON formatted message for the genotation-upload.js background script.
	Author: Ethan Willis
*/


// Build a message to send to the background script.
function build_message(url_string, content, content_type) {
	message = {"url": url_string, "content": content, "content_type": content_type};
	return message;
}

// Send message to background script to handle sending the page content to a web service.
function send_message(message) {
	console.log("final message: " + JSON.stringify(message));
	chrome.runtime.sendMessage(message);
}

// Base64 encodes an array buffer. 
function base64_encode(buffer) {
	console.log("Base64 encoding data");
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode( bytes[ i ] );
	}
	console.log("Finished Base64 encoding");
	return window.btoa( binary );
}

/**
 * The following three function handle_* take an xhr response, and send the URL content, content_type, and URL string to a background script so it can be sent off to a webservice. Each of these handle_* functions handles an xhr response for the varying content_types that Genotation supports. Currerntly the supported types are HTML files and PDF files.
 */
function get_pdf_content(url_string, content_type, CORS_error) {
	if(CORS_error) {
		console.log("Handling PDF file with CORS restriction");
		// Get array buffer of PDF file from PDF.js(
		try{ 
			unsafeWindow.PDFViewerApplication.pdfDocument.getData().then(function(data) {
				url_content = base64_encode(data);
				message = build_message(url_string, url_content, content_type)
	
				// send message with bas64 encoded pdf and metadata to background script.
				send_message(message);
			});
		} catch (err) {
			console.log("Error converting PDF arraybuffer to Base64: " + err);
		}
	} else {
		console.log("Handling PDF file with no CORS restriction");
		url_content = xhr_request.response;
		message = build_message(url_string, url_content, content_type);
	}
}

function get_html_content(url_string, content_type) {;
	url_content = document.body;
	message = build_message(url_string, url_content, content_type)
	

	// send message with page data and metadata to background script.
	send_message(message);
}

function get_unsupported_content(url_string, content_type) {
	url_content = "Unsupported Content";
	content_type = "unsupported content type";
	message = build_message(url_string, url_content, content_type)

	// send message with page data and metadata to background script.
	send_message(message);
}


/*
 * Gets a file via XHR from a URL. Then returns an object containing
 * the content, file MIME type, and url
 */
function get_url_xhr(url_string) {
	console.log("Building XHR request: " + url_string);
	var xhr_request = new XMLHttpRequest();
	// fetch non cached version of page. 
	xhr_request.open("GET", (url_string+"?_="+new Date().getTime()), true);
	
	xhr_request.addEventListener("load", function() {
		CORS_error = false;
		// We are not blocked by CORS restrictions, so we are not reading a local file.
		try { 
			console.log("XHR response received");
			content_type_regex = new RegExp(/(^text\/html)|(^text\/htm)|(^application\/pdf)/);
			content_type_header = xhr_request.getResponseHeader('content-type');
			content_type = content_type_regex.exec(content_type_header);
			console.log("Finished parsing XHR content-type: " + content_type);
		
			url_content = null;
			// handle file content based on content-type returned by server.
			if(content_type == null) {
				content_type = "unsupported";
				url_content = get_unsupported_content(url_string, content_type);
			} else if(content_type[1] == "text/html") {
				url_content = get_html_content(url_string, content_type[1]);
			} else if(content_type[2] == "text/htm") {
				url_content = get_html_content(url_string, content_type[2]);
			} else if(content_type[3] == "application/pdf") {
				url_content = get_pdf_content(url_string, content_type[3], CORS_error);
			} 
		} catch (err) {
			console.log("Error Getting Page Data");
		}
	});

	// Handle CORS errors
	xhr_request.addEventListener("error",function() {
		// Normally CORS errors should only happen if the content type is application/pdf 
		// due to PDF.js messing up the file resource origin. So on a CORS error attempt
		// to pull pdf data and send a message that way.
		// If a user has PDF.js disabled in their browser than the regular readyState==4&&status==200
		// condition will get the PDF data correctly.
		CORS_error = true;
		// TODO: If there are other applications that change the origin of the request for different
		// content-types we need to handle those in the future.
		get_pdf_content(url_string, 'application/pdf', CORS_error);
	});

	console.log("Sending XHR request to get content_type");
	xhr_request.send();
}

chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if(message.action == "get_page_content") {
			// get webpage url
			url_string = document.location.href;
		
			console.log("Getting url: " + url_string + " via XHR");

			// get the URL over xhr and send the page content and metadata as a message to the background script.
			get_url_xhr(url_string);
		}
	}
);

