/* eslint-disable @typescript-eslint/ban-ts-comment */
export const setupDragDrop = (
  elementId: string,
  className: string,
  load: (file: File, event: ProgressEvent<FileReader>) => void
) => {
  const holder = document.getElementById(elementId);
  if (!holder) {
    return;
  }
  holder.ondragover = function () {
    // @ts-expect-error
    this.className = className;
    return false;
  };
  holder.ondragend = function () {
    // @ts-expect-error
    this.className = '';
    return false;
  };
  holder.ondrop = function (e) {
    // @ts-expect-error
    this.className = '';
    e.preventDefault();
    // @ts-expect-error
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = (event) => load(file, event);
    reader.readAsDataURL(file);
  };
};
