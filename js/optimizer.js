import getSvgoInstance from 'svgo-browser/lib/get-svgo-instance';

const getElements = name => document.getElementsByClassName(name);
const getElement = name => document.getElementById(name);

let originalSvg;

const elements = {
  checkboxes: getElements("checkboxes"),
  outputSvg: getElement("outputSvg"),
  optimizedOuput: getElement("optimizedOuput"),
  colorOuput: getElement("colorOuput"),
  inputElement: getElement("inputField"),
  bitSize: 0,
}

let defoultConfig = {
  cleanupAttrs: true,
  removeDoctype: true,
  removeXMLProcInst: true,
  removeComments: true,
  removeMetadata: true,
  removeTitle: true,
  removeDesc: true,
  removeUselessDefs: true,
  removeEditorsNSData: true,
  removeEmptyAttrs: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  removeEmptyContainers: true,
  removeViewBox: false,
  cleanupEnableBackground: true,
  convertStyleToAttrs: true,
  convertColors: true,
  convertPathData: true,
  convertTransform: true,
  removeUnknownsAndDefaults: true,
  removeNonInheritableGroupAttrs: true,
  removeUselessStrokeAndFill: true,
  removeUnusedNS: true,
  cleanupIDs: true,
  cleanupNumericValues: true,
  moveElemsAttrsToGroup: true,
  moveGroupAttrsToElems: true,
  collapseGroups: true,
  removeRasterImages: false,
  mergePaths: true,
  convertShapeToPath: true,
  sortAttrs: true,
  removeDimensions: true,
}

let config = defoultConfig;

function SvgOptimize(file,options) {
  const svgo = getSvgoInstance(options);
    svgo.optimize(file).then(svg => {
      elements.bitSize = formatBytes(new Blob([svg.data]).size);
      elements.optimizedOuput.innerHTML = `Optimized: ${elements.bitSize}`;
      elements.outputSvg.innerHTML = svg.data;
    });
 
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

elements.inputElement.addEventListener("change", handFile, false);

function resetcheckboxes() {
  for (let checkbox of elements.checkboxes) {
    checkbox.checked = false;
  }
}

function handFile() {
  resetcheckboxes();
  const file = this.files
  fileName = file.name;
  file[0].text().then(data => {
    originalSvg = data;
    SvgOptimize(data, config);
  });

  for (let checkBox of elements.checkboxes) {
    if (config[checkBox.name]) {
      checkBox.checked = config[checkBox.name];
    } 
    checkBox.addEventListener('change', function () {

      this.checked ? config[checkBox.name] = true : config[checkBox.name] = false;
      SvgOptimize(originalSvg, config);
    });
  }
}



document.getElementById("pallet").addEventListener("click", () => {
  elements.colorOuput = getElement("colorOuput");
  let colors = document.getElementsByTagName("path");
  let colorPickers = document.getElementsByClassName("colorPickers");
  if (colorPickers.length > 0) {
    elements.colorOuput.innerHTML = "";
  }
  for (let color of colors) {
      if (color.attributes.fill != null && document.getElementById(color.attributes.fill.value) == null) {
        elements.colorOuput.innerHTML += `<input class="colorPickers" type="color" id=${color.attributes.fill.value} value=${color.attributes.fill.value}>`
      }
  }
  colorPickers = document.getElementsByClassName("colorPickers");
  for (let Picker of colorPickers) {
    Picker.addEventListener("change", event => {
      let newId;
      for (let color of colors) {
        if (color.attributes.fill != null && color.attributes.fill.value == event.target.id) {
          color.attributes.fill.value = event.target.value;
          newId = event.target.value;
          elements.optimizedOuput.innerHTML = `Optimized: ${elements.bitSize}`;
        }
      }
      event.target.id = newId
    });
  }
})


