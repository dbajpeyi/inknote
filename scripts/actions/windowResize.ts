﻿module Inknote {

    if (typeof window != "undefined") {
        window.onresize = function () {

            Inknote.ScoringService.Instance.refresh();
            if (Inknote.ScoringService.Instance.maxScrollPosition < Inknote.ScrollService.Instance.y) {
                Inknote.ScrollService.Instance.y = Inknote.ScoringService.Instance.maxScrollPosition - 100;
            }
        }
    }
} 