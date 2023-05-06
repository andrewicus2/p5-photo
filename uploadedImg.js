class uploadedImg {
  constructor(imgData,x, y, i, w, h) {
    this.x = x;
    this.y = y;
    this.i = i;

    this.rawData = imgData;

    // if(match(imgData,"data")==null){
    console.log(typeof imgData)
    if(typeof imgData == "object"){
      console.log(imgData)
      this.img = imgData;
      this.w = w;
      this.h = h;
    } else {
      this.img = loadImage(imgData, () => {
        if(w){
          this.w = w;
          this.h = h;
        } else {
          console.log(this.img.height)
          this.w = this.img.width;
          this.h = this.img.height;
          if(this.img.height > height+10){
            let reductionFactor = this.img.height/height
            this.w /= reductionFactor;
            this.h /= reductionFactor;
          } 
        }
      });
    }

    this.hover = false;
    this.dragging = false;
  }
  
  hovering() {
    return (tool == 0 && mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h) 
  }

  activeHover(){
    return(this.hovering() && hovering.img == this.img)
  }

  resizeHover(){
    return (this.activeHover() && tool == 0 && mouseX > this.x + this.w - 15 && mouseX < this.x+this.w && mouseY > this.y + this.h - 15 && mouseY < this.y + this.h)
  }

  layerUp(){
    return (this.activeHover() && mouseIsPressed && tool == 0 && mouseX > this.x + this.w - 35 && mouseX < this.x+this.w-20 && mouseY > this.y+this.h-15&& mouseY < this.y + this.h)
  }

  layerDown(){
    return (this.activeHover() && mouseIsPressed && tool == 0 && mouseX > this.x + this.w - 55 && mouseX < this.x+this.w - 35 && mouseY > this.y+this.h-15&& mouseY < this.y + this.h)
  }

  delete(){
    return (this.activeHover() && mouseIsPressed && tool == 0 && mouseX > this.x + this.w - 75 && mouseX < this.x+this.w - 55 && mouseY > this.y+this.h-15 && mouseY < this.y + this.h)
  }
  
  pressed() {
    if(this.activeHover() && this.resizeHover()){
      this.resizing = true;
      this.offsetX = (this.x + this.w) - mouseX;
      this.offsetY = (this.y + this.h) - mouseY
    }
    else if(this.activeHover()){
      this.dragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
    }
  }
  
  released() {
    this.dragging = false;
    this.resizing = false;
  }

  display() {
    cursor(ARROW)
    
    if (this.activeHover()) {
      cursor(MOVE)
      fill(0, 0);
      stroke('#000');
      strokeWeight(3);
      rect(this.x - 1.5, this.y - 1.5, this.w + 3, this.h + 3);
    }

    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    }

    if(this.resizing){
        this.w = mouseX - this.x + this.offsetX;
        this.h = mouseY - this.y + this.offsetY;
    }
   
    image(this.img, this.x, this.y, this.w, this.h);

    if(this.activeHover()) {
      push()
      fill(0)
      translate(this.x+this.w-75,this.y+this.h-15,15)
      rect(0,0,75,15)
      image(trashIcon,2,0,12,15)
      image(downArrowIcon,20,0,13,15)
      image(upArrowIcon,40,0,13,15)
      image(resize,60,0,15,15)
      pop()
      fill(0)
    }

    if(this.layerUp()){
      imgs.splice(this.i,1)
      imgs.push(new uploadedImg(this.rawData,this.x,this.y,imgs.length, this.w, this.h))
    }

    if(this.layerDown()){
      imgs.splice(this.i,1)
      imgs.unshift(new uploadedImg(this.rawData,this.x,this.y,imgs.length, this.w, this.h))
    }

    if(this.delete()){
      imgs.splice(this.i,1)
    }

  }
  
}
