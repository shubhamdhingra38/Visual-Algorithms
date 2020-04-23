function initialDraw(){
    clear();
    fill('rgba(255, 255, 255, 0.2)');
    stroke(color(0, 255, 0));
    rect(0, 0, cnv.width, cnv.height);
}

function isMouseInside(x1, x2, y1, y2) {
    if (mouseX >= x1 && mouseX <= x2 && mouseY >= y1 && mouseY <= y2) {
      return true;
    }
    return false;
  }