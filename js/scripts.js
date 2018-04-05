var reader;
var progress = document.querySelector('.percent');

function abortRead() {
  reader.abort();
}

function errorHandler(evt) {
  switch(evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
      alert('File Not Found!');
      break;
    case evt.target.error.NOT_READABLE_ERR:
      alert('File is not readable');
      break;
    case evt.target.error.ABORT_ERR:
      break; // noop
    default:
      alert('An error occurred reading this file.');
  };
}

function updateProgress(evt) {
  // evt is an ProgressEvent.
  if (evt.lengthComputable) {
    var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
    // Increase the progress bar length.
    if (percentLoaded < 100) {
      progress.style.width = percentLoaded + '%';
      progress.textContent = percentLoaded + '%';
    }
  }
}

function handleFileSelect(evt) {
  // Reset progress indicator on new file selection.
  progress.style.width = '0%';
  progress.textContent = '0%';

  reader = new FileReader();
  reader.onerror = errorHandler;
  reader.onprogress = updateProgress;
  reader.onabort = function(e) {
    alert('File read cancelled');
    setTimeout("document.getElementById('progress_bar').className='';", 2000);
  };
  reader.onloadstart = function(e) {
    document.getElementById('progress_bar').className = 'loading';
  };
  reader.onload = function(e) {
    // Ensure that the progress bar displays 100% at the end.
    progress.style.width = '100%';
    progress.textContent = '100%';
    setTimeout("document.getElementById('progress_bar').className='';", 2000);
    processFile(reader.result);
  }

  // Read in the image file as a binary string.
  reader.readAsText(evt.target.files[0]);
}

/**
 * Read text by line and execute suitable commands
 * @param {*} text 
 */
function processFile(text) {
  arrayOfLines = text.match(/[^\r\n]+/g);
  for (let line of arrayOfLines) {
    try {
      let matched = false;

      //Pattern matching
      if (line.match(/^u,\d+,\d+,bid$/)) {
        let [action, price, size, type] = line.split(',');
        market.updateOrder(type, Number(price), Number(size));

      } else if (line.match(/^u,\d+,\d+,ask$/)) {
        let [action, price, size, type] = line.split(',');
        market.updateOrder(type, Number(price), Number(size));

      } else  if (line.match(/^o,buy,\d*$/)) {
        let [action, command, size] = line.split(',');
        market.buy(Number(size));

      } else if (line.match(/^o,sell,\d*$/)) {
        let [action, command, size] = line.split(',');
        market.sell(Number(size));

      } else if (line.match(/^q,best_bid$/)) {
        let best = market.getBestBid();
        console.log(best, market.bid.get(best));

      } else if (line.match(/^q,best_ask$/)) {
        let best = market.getBestAsk();
        console.log(best, market.ask.get(best));

      } else if (line.match(/^q,size,\d+$/)) {
        let [action, command, price] = line.split(',');
        console.log(market.getSize(Number(price)));

      } else {
        throw "Unknown or corrupted command";

      }
    }
    catch(e) {
      console.log("In line: " + line + " - " + e);
    }
  }
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
