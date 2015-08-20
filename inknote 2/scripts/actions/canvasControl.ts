﻿module Inknote {

    interface MouseMoveEvent extends MouseEvent {
        movementX: number;
        movementY: number;
    }

    interface Touch {
        identifier: number;
        target: EventTarget;
        screenX: number;
        screenY: number;
        clientX: number;
        clientY: number;
        pageX: number;
        pageY: number;
    };

    interface TouchEvent extends UIEvent {
        touches: Touch[];
        targetTouches: Touch[];
        changedTouches: Touch[];
        altKey: boolean;
        metaKey: boolean;
        ctrlKey: boolean;
        shiftKey: boolean;
    };

    declare var TouchEvent: {
        prototype: TouchEvent;
        new (): TouchEvent;
    }

    class TouchCopy {
        constructor(public identifier: number, public pageX: number, public pageY: number) {

        }
    }

    function copyTouch(touch: Touch): TouchCopy {
        return new TouchCopy(touch.identifier, touch.pageX, touch.pageY);
    }

    export class CanvasControl {

        hover(e: MouseEvent) {
            var allItems = this.drawService.items;
            var hovered = false;

            var scoreItems: Notation[] = [];

            for (var i = 0; i < allItems.length; i++) {
                if (mouseIsOver(allItems[i], e, this.drawService.canvas)) {
                    // log(allItems[i].y + ":" + e.clientY + ":" + ScrollService.Instance.y);

                    if (Managers.PageManager.Current.page == Managers.Page.Score) {
                        if (allItems[i] instanceof Notation) {
                            scoreItems.push(<Notation>allItems[i]);
                        }
                    }

                    var hoverID = allItems[i].ID;
                    Managers.ProjectManager.Instance.hoverID = hoverID;
                    hovered = true;
                    this.drawService.canvas.style.cursor = "pointer";
                }
            }

            var sortedScoreItems = <Notation[]>scoreItems.sort(function (a: Notation, b: Notation) { return b.order - a.order; });
            if (sortedScoreItems.length > 0) {
                ScoringService.Instance.hoverID = sortedScoreItems[0].ID;
            }
            else {
                ScoringService.Instance.hoverID = null;
            }

            if (!hovered) {
                Managers.ProjectManager.Instance.hoverID = null;
                this.drawService.canvas.style.cursor = "";
            }
        }

        click(e: MouseEvent) {
            var allItems = this.drawService.items;
            var selected = false;

            var scoreItems: Notation[] = [];

            var sortedItems = [];

            for (var i = 0; i < allItems.length; i++) {
                sortedItems.push(allItems[i]);
            }

            sortedItems.sort(function (a: IDrawable, b: IDrawable) { return b.order - a.order; });

            for (var i = 0; i < sortedItems.length; i++) {
                if (mouseIsOver(sortedItems[i], e, this.drawService.canvas)) {
                    var selectedID = sortedItems[i].ID;

                    // rightClick menu
                    if (selectedID == RightClickMenuService.Instance.Menu.ID) {
                        RightClickMenuService.Instance.Menu.click(e);
                        RightClickMenuService.Instance.visible = false;
                        return;
                    }

                    // note control.
                    if (selectedID == NoteControlService.Instance.ID) {
                        if (e.clientY - 50 > NoteControlService.Instance.piano.y) {
                            NoteControlService.Instance.piano.click(e);
                        }
                        else if (e.clientY - 50 < NoteControlService.Instance.y) {
                            NoteControlService.Instance.minimise.click(e);
                        }
                        else if (NoteControlService.Instance.restControl.isOver(e.clientX, e.clientY - 50)) {
                            NoteControlService.Instance.restControl.click(e);
                        }
                        else if (NoteControlService.Instance.deleteNoteControl.isOver(e.clientX, e.clientY - 50)) {
                            NoteControlService.Instance.deleteNoteControl.click(e);
                        }
                        else {
                            NoteControlService.Instance.lengthControl.click(e);
                        }
                        return;
                    }

                    // if keyboard clicked, do keyboard action.
                    if (selectedID == Drawing.Keyboard.Instance.ID) {
                        Drawing.Keyboard.Instance.click(e);
                        return;
                    }

                    // " " bottom menu
                    if (selectedID == Drawing.BottomMenu.Instance.ID) {
                        Drawing.BottomMenu.Instance.click(e);
                        return;
                    }

                    // scroll bar
                    if (selectedID == ScrollService.ScrollBar.ID) {
                        ScrollService.ScrollBar.click(e);
                        return;
                    }

                    // scroll thumbnail
                    if (selectedID == ScrollService.ScrollBar.scrollThumbnail.ID) {
                        ScrollService.ScrollBar.scrollThumbnail.click(e);
                        return;
                    }

                    // licence
                    if (selectedID == LicenceService.Instance.drawing.ID) {
                        LicenceService.Instance.drawing.click(e);
                        return;
                    }

                    if (Managers.PageManager.Current.page == Managers.Page.Score) {
                        if (sortedItems[i] instanceof Notation) {
                            scoreItems.push(<Notation>sortedItems[i]);
                        }
                    }

                    Managers.ProjectManager.Instance.selectID = selectedID;

                    selected = true;
                }
            }

            var sortedScoreItems = <Notation[]>scoreItems.sort(function (a: Notation, b: Notation) { return b.order - a.order; });
            if (sortedScoreItems.length > 0) {
                ScoringService.Instance.selectID = sortedScoreItems[0].ID;
            }
            else {
                ScoringService.Instance.selectID = null;
            }

            if (!selected) {
                // clear
                ScrollService.ScrollBar.scrollThumbnail.visible = false;
                Managers.ProjectManager.Instance.selectID = null;
                RightClickMenuService.Instance.visible = false;
            }
        }

        dblClick(e: MouseEvent) {
            if (Managers.PageManager.Current.page == Managers.Page.File) {
                if (Managers.ProjectManager.Instance.selectID) {
                    Managers.ProjectManager.Instance.openSelectedProject();
                }
            }
        }

        mouseDown(e: MouseEvent, drawService: DrawService) {
            var onMove = function (e: MouseMoveEvent) {
                // ScrollService.Instance.x += e.movementX;

                if (e.movementY > 0 && canScroll(true) || e.movementY < 0 && canScroll(false)) {
                    ScrollService.Instance.y -= e.movementY;
                }
                drawService.canvas.style.cursor = "-webkit-grabbing";
            }

            drawService.canvas.addEventListener("mousemove", onMove, false);

            drawService.canvas.onmouseup = function (e: MouseEvent) {
                drawService.canvas.removeEventListener("mousemove", onMove, false);
            }

            drawService.canvas.onmouseout = function (e: MouseEvent) {
                drawService.canvas.removeEventListener("mousemove", onMove, false);
            }
        }

        touchCopies: TouchCopy[] = [];
        getTouchCopyByID(ID: number): TouchCopy {
            for (var i = 0; i < this.touchCopies.length; i++) {
                if (this.touchCopies[i].identifier == ID) {
                    return this.touchCopies[i];
                }
            }
            return null;
        }

        touchStart(e: TouchEvent, drawService: DrawService) {

            var touches = e.touches;

            this.touchCopies = [];

            for (var i = 0; i < touches.length; i++) {
                this.touchCopies.push(copyTouch(touches[i]));
            }

            var self = this;

            var onMove = function (e: TouchEvent) {
                var touches = e.changedTouches;

                for (var i = 0; i < touches.length; i++) {
                    var touch = touches[i];

                    var lastTouch = self.getTouchCopyByID(touch.identifier);

                    var movementX = touch.pageX - lastTouch.pageX;
                    var movementY = touch.pageY - lastTouch.pageY;

                    if (movementY > 0 && canScroll(true) || movementY < 0 && canScroll(false)) {
                        ScrollService.Instance.y -= movementY;
                    }

                    lastTouch.pageX = touch.pageX;
                    lastTouch.pageY = touch.pageY;
                }
            }

            drawService.canvas.addEventListener("touchmove", onMove, false);

            drawService.canvas.addEventListener("touchend", function (e: TouchEvent) {
                drawService.canvas.removeEventListener("touchmove", onMove, false);
            }, false);

            drawService.canvas.addEventListener("touchleave", function (e: TouchEvent) {
                drawService.canvas.removeEventListener("touchmove", onMove, false);
            }, false);
        }

        rightClick(e: MouseEvent) {

            RightClickMenuService.Instance.openMenu(e.clientX, e.clientY - 50, this.drawService.canvas);

            e.preventDefault();

        }

        constructor(public drawService: DrawService) {

            var self = this;

            this.drawService.canvas.onmouseover = function (e: MouseEvent) {
                self.drawService.canvas.onmousemove = function (me: MouseEvent) {
                    self.hover(me);
                }
            }

            this.drawService.canvas.onmouseout = function (e: MouseEvent) {
                self.drawService.canvas.onmousemove = null;
            }

            this.drawService.canvas.onclick = function (e: MouseEvent) {
                self.click(e);
            }

            this.drawService.canvas.ondblclick = function (e: MouseEvent) {
                self.dblClick(e);
            }

            this.drawService.canvas.onmousedown = function (e: MouseEvent) {
                self.mouseDown(e, drawService);
            }

            // right click
            this.drawService.canvas.oncontextmenu = function (e: MouseEvent) {
                self.rightClick(e);
            }

            this.drawService.canvas.addEventListener("touchstart", function (e: TouchEvent) {
                self.touchStart(e, self.drawService);
            }, false);

        }

    }

}