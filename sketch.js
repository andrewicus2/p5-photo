// Object Based multi - Image upload
// Created using this code as a base:
// https://p5js.org/reference/#/p5/createFileInput
// https://editor.p5js.org/icm/sketches/BkRHbimhm

// @Drew Brown
// @4.23.23

let input;
let imgs = [];
let curDrawings = [];
let undidDrawings = [];
let resize, rotateIcon;
let bgfill;

let drawingBuffer;

let menuCurOpen;

let tools = ['hand','pencil','bucket','filters']
let tool;

let canLocked;

let drawing;

let canW, canH

let hovering;

let fillColorPicker;

let r, area, threshold;

let dan1,dan2,dan3,dan4


let sharpen = [
  [0, -1, 0],
  [-1, 13, -1],
  [0, -1, 0],
];

let boxBlur = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

let gausBlur = [
  [0, 1, 0],
  [1, 5, 1],
  [0, 1, 0],
];

let emboss = [
  [-2, -1, 0],
  [-1, 9, 1],
  [0, 1, 2],
];

let edges = [
  [-1, -1, -1],
  [-1, 17, -1],
  [-1, -1, -1],
];

let brighten = [
  [1.1,1.1,1.1],
  [1.1,1.1,1.1],
  [1.1,1.1,1.1]
]

let darken = [
  [0.9,0.9,0.9],
  [0.9,0.9,0.9],
  [0.9,0.9,0.9]
]
// 0 = hand
// 1 = pen
// 2 = bucket

function preload(){
  resize = loadImage('imgs/resize.png')
  upArrowIcon = loadImage('imgs/up-arrow.png')
  downArrowIcon = loadImage('imgs/down-arrow.png')
  trashIcon = loadImage('imgs/trash.png')
  dan1 = loadImage('dan/dan1.jpg')
  dan2 = loadImage('dan/dan2.jpg')
  dan3 = loadImage('dan/dan3.jpg')
  dan4 = loadImage('dan/dan4.jpg')
}

function setup() {
  angleMode(DEGREES)
  pixelDensity(1)
  canW = floor(windowWidth/1.2)
  canH = floor(windowHeight/1.3)
  const canvas = createCanvas(canW, canH);
  canvas.parent('sketch-holder')
  drawingBuffer = createGraphics(canW, canH)

  input = createFileInput(handleFile);
  input.parent('ui-container')
  input.id('image-up')

  tool = 0;
  canLocked = false;
  menuCurOpen = "";
  drawing = false;

  fillColorPicker = createColorPicker('#E3E3E3');
  fillColorPicker.id('bgColorPicker')
  fillColorPicker.parent('bucketui')

  pencilColorPicker = createColorPicker('#000');
  pencilColorPicker.parent('pencil-color-picker-container')
  pencilColorPicker.id('pencilColorPicker')

  pencilStrokeWeightSlider = createSlider(1,100,10)
  pencilStrokeWeightSlider.parent('slider-container')

  blurB = createButton("Apply");
  resetB = createButton("Reset");
  unlockB = createButton("Unlock Canvas")
  saveFiltersB = createButton("Save Filters")

  blurB.class("sub-ui-button")
  resetB.class("sub-ui-button")
  unlockB.class("sub-ui-button")
  saveFiltersB.class("sub-ui-button")

  blurB.parent('filtersui')
  resetB.parent('filtersui')
  unlockB.parent('filtersui')
  saveFiltersB.parent('filtersui')

  blurB.mousePressed(blurImg);
  resetB.mousePressed(resetImg);
  unlockB.mousePressed(unlockCan)
  saveFiltersB.mousePressed(openFilterAlert)

  drawingSaveB = createButton("Save Layer");
  drawingSaveB.class("sub-ui-button")
  drawingSaveB.id("primary-sub-ui-button")
  drawingSaveB.parent("pencilui")
  drawingSaveB.mousePressed(saveDrawing)

  r=1;
    
  fSel = createSelect();
  fSel.id("filter-select")
  fSel.parent('filter-select-container')
  fSel.option('Sharpen');
  fSel.option('Box Blur');
  fSel.option('Gaus Blur');
  fSel.option('Threshold');
  fSel.option('Brighten');
  fSel.option('Darken');
  fSel.option('Emboss');
  fSel.option('Edge Detect');
  
  

  filterAmountSlider = createSlider(1,10,1)
  filterAmountSlider.parent('filter-slider-container')
  
 
}

function windowResized() {
  canW = floor(windowWidth/1.2)
  canH = floor(windowHeight/1.3)
  resizeCanvas(canW, canH)

  drawingBuffer.resizeCanvas(canW, canH)
}

function draw() {
  background(fillColorPicker.value());

  hovering = "";
 
  
  for(let i = imgs.length-1; i>-1;i--){
    if(hovering == "" && imgs[i].hovering()){
      hovering = imgs[i] 
    }
  }



  for(let i = 0; i<imgs.length;i++){
    imgs[i].i = i;
    imgs[i].display();
  }

  if(tool==1){
    for(let i=0;i<curDrawings.length;i++){
      image(curDrawings[i],0,0,width,height)
    }
  }

  if(tool==1 && mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
    drawingBuffer.stroke(pencilColorPicker.value())
    drawingBuffer.strokeWeight(pencilStrokeWeightSlider.value());
    drawingBuffer.line(mouseX, mouseY, pmouseX, pmouseY)
    image(drawingBuffer,0,0,width,height)
    drawing = true;
  }
}

function saveDrawing(){
  select('#unsaved-drawing-confirm').style('display','none')
  if(curDrawings.length == 0){
    changeTool(0)
    undidDrawings = []
    drawingBuffer.clear()
  } else {
    drawingBuffer.clear();
    for(let i=0;i<curDrawings.length;i++){
      drawingBuffer.image(curDrawings[i],0,0,width,height)
    }
    let penStroke = drawingBuffer.get();
    imgs.push(new uploadedImg(penStroke,0,0,imgs.length,width,height))
    resetDrawing()
    drawingBuffer.clear()
    changeTool(0)
  }
}

function undoDrawing(){
  if(curDrawings.length>0){
    undidDrawings.push(curDrawings[curDrawings.length-1])
    curDrawings.splice(curDrawings.length-1,1);
    drawingBuffer.clear();
  } else {
    console.log('nothing to undo')
  }
}

function redoDrawing(){
  if(undidDrawings.length>0){
    curDrawings.push(undidDrawings[undidDrawings.length-1])
    undidDrawings.splice(undidDrawings.length-1,1)
  } else {
    console.log('nothing to redo')
  }
}

function resetDrawing(){
  curDrawings = [];
  drawingBuffer.clear()
  undidDrawings = [];
}


function handleFile(file) {
  if (file.type === 'image') {
    let tempImg = file.data;
    imgs.push(new uploadedImg(tempImg,0,0,imgs.length))
    changeTool(0)
  } else {
    console.log("not an image file, please try another")
  }
  input.value('') // resets so you can upload same file twice

}

function mousePressed() {
  for(let i = 0; i<imgs.length;i++){
    imgs[i].pressed();
  }
}

function mouseReleased() {
  for(let i = 0; i<imgs.length;i++){
    imgs[i].released();
  }

  if(mousePressed && menuCurOpen != ""){
    closeMenu();
  }

  if(drawing){
    curDrawings.push(drawingBuffer.get())
    drawing = false;
  }
}


function changeTool(toolID){

  if(tool==1&&curDrawings.length>0){
    select('#unsaved-drawing-confirm').style('display','block')
  } else {
    select('#welcome-ui').style('display','none');
    let prev = select('#'+tools[tool])
    prev.style('background', '#fff')
    prev.style('color', '#000')

    let prevui = select('#'+tools[tool]+'ui')
    prevui.style('display','none');

    tool = toolID;

    let cur = select('#'+tools[tool])

    cur.style('background', '#000')
    cur.style('color', '#fff')

    let curui = select('#'+tools[tool]+'ui')
    curui.style('display','flex')
  }
}

function clearCanvasConfirm(){
  select('#delete-confirm').style('display','block')
}

function closeAlert(id){
  select('#'+id).style('display','none')
}



function clearCanvas(){
  fillColorPicker.value('#ffffff')
  bgfill = fillColorPicker.value()
  imgs=[]
  drawingBuffer.clear()
  select('#delete-confirm').style('display','none')
}

function lockCanvasConfirm(){
  select('#lock-confirm').style('display','block')
}


function lockCan(){
  select('#lock-confirm').style('display','none')
  select('#ui-cover').style('display','block')
  changeTool(3)
  noLoop()
}

function openFilterAlert(){
  select('#filter-confirm').style('display','block')
}

function saveFilters(){
  imgs = []
  let newImg = get()
  imgs.push(new uploadedImg(newImg,0,0,imgs.length,width,height))
  closeAlert('filter-confirm')
}

function resetImg() {
  redraw()
}

function unlockCan(){
  changeTool(0)
  select('#ui-cover').style('display','none')
  loop()
}

// function saveCanvas() {
//   saveCanvas();
// }

function lookUp(){
  switch (fSel.value()) {
    case 'Sharpen':
      return sharpen;
    case 'Box Blur':
      return boxBlur;
    case 'Gaus Blur':
      return gausBlur;
    case 'Emboss':
      return emboss;  
    case 'Edge Detect':
      return edges;
    case 'Brighten':
      return brighten;
    case 'Darken':
      return darken;
    case 'Threshold':
      return 'threshold';
  }
}

function blurImg() {
  loadPixels();
  
  
  let kernel = lookUp();


  if(kernel == 'threshold'){
    let threshold = map(filterAmountSlider.value(),1,10,50,200);

    for (let y = r; y < height - r; y++) {
      for (let x = r; x < width - r; x++) {
        var midM = (x + y * width) * 4
        var midL = ((x-1) + y * width) * 4
        var botM = (x + (y+1) * width) * 4

        let curLum = (pixels[midM] + pixels[midM+1] + pixels[midM+2])/3
        let leftLum = (pixels[midL] + pixels[midL+1] + pixels[midL+2])/3
        let botLum = (pixels[botM] + pixels[botM+1] + pixels[botM+2])/3

        if(abs(curLum-leftLum) > threshold || abs(curLum-botLum) > threshold){
          pixels[midM] = 255
          pixels[midM+1] = 255
          pixels[midM+2] = 255
        } else {
          pixels[midM] = 0
          pixels[midM+1] = 0
          pixels[midM+2] = 0
        }
      }
    }
  } else {
  
    area = sq(2 * r + 1);

    for(let t=0;t<filterAmountSlider.value();t++){
      for (let y = r; y < height - r; y++) {
        for (let x = r; x < width - r; x++) {
          let aR = 0,
            aG = 0,
            aB = 0

          for (let iy = -r; iy <= r; iy++) {
            for (let ix = -r; ix <= r; ix++) {
              let loc = (x + ix + (y + iy) * width) * 4;
              aR += pixels[loc] * kernel[iy+1][ix+1];
              aG += pixels[loc + 1] * kernel[iy+1][ix+1];
              aB += pixels[loc + 2] * kernel[iy+1][ix+1];
            }
          }

          aR /= area;
          aG /= area;
          aB /= area;

          let index = (x + y * width) * 4;

          pixels[index] = aR;
          pixels[index + 1] = aG;
          pixels[index + 2] = aB;
        }
      }
    }
  }
  updatePixels();
}

function openAboutMenu(){
  select('#about-menu').style('display','block')
}

function dan(){
  imgs.push(new uploadedImg(dan2,0,0,imgs.length,dan2.width,dan2.height))
  imgs.push(new uploadedImg(dan1,100,200,imgs.length,dan1.width,dan1.height))
  imgs.push(new uploadedImg(dan3,500,400,imgs.length,dan3.width,dan3.height))
  imgs.push(new uploadedImg(dan4,150,50,imgs.length,dan4.width/2,dan4.height/2))
}

function menuOpen(menuID){
  let menu = select("#" + menuID)
  let header = select("#" + menuID + "-title")
  if(menu.style('display') == 'none'){
    menu.style('display', 'flex')
    header.style('background', '#000')
    header.style('color', '#fff')
    menuCurOpen = menuID
  } else {
    menu.style('display','none')
  }
}

function closeMenu(){
  let menu = select("#" + menuCurOpen)
  let header = select("#" + menuCurOpen + "-title")
  if(menuCurOpen!=""){
    menu.style('display','none')
    header.style('background', '#fff')
    header.style('color', '#000')
  }
  menuCurOpen = ""
}

