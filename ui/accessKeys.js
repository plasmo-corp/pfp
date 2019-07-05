/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

// This regexp has been generated by generateVowelsRegexp.js
const vowelRegexp = /[AEIOUaeiouªºÀ-ÆÈ-ÏÒ-ÖÙ-Üà-æè-ïò-öù-üĀ-ąĒ-ěĨ-İĲĳŌ-őŨ-ųƠơƯưǍ-ǜǞ-ǣǪ-ǭǺ-ǽȀ-ȏȔ-ȗȦ-ȱΆΈ-ΊΌΎ-ΑΕΗΙΟΥΩ-αεηιουω-ώϒ-ϔϵЀЁЄІЇЍЎАЕИЙОУЫЭ-аеийоуыэ-ёєіїѝўӐ-ӓӖӗӢ-ӧӬ-ӳӸӹᴬᴭᴱᴵᴼᵁᵃᵉᵒᵘᵢᵤḀḁḔ-ḝḬ-ḯṌ-ṓṲ-ṻẚẠ-ựἀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-ΰῦ-Ύῲ-ῴῶ-ῼⁱₐ-ₒℐℑΩÅℯℰℴℹⅇⅈﬁﬃＡＥＩＯＵａｅｉｏ]/;
const fallbackKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

const isLetter = (function()
{
  try
  {
    let regexp = new RegExp("\\p{Letter}", "u");
    return char => regexp.test(char);
  }
  catch (e)
  {
    // Fallback if Unicode property escapes aren't supported
    return char => char.toLowerCase() != char || char.toUpperCase() != char;
  }
})();

function isUpperCase(char)
{
  return char == char.toUpperCase();
}

function isConsonant(char)
{
  return !vowelRegexp.test(char);
}

let accessKeys = null;
let accessKeyHints = null;
let observer = null;

function onKeyDown(event)
{
  if (!accessKeys && event.key == "Alt" && !event.ctrlKey && !event.metaKey)
    showHints();
  else if (accessKeys && event.altKey && !event.ctrlKey && !event.metaKey)
    triggerHint(event);
}

function onKeyUp(event)
{
  if (!event.altKey)
    hideHints();
}

function onBlur(event)
{
  if (event.eventPhase == Event.AT_TARGET)
    hideHints();
}

function showHints()
{
  let elements = [];
  let root = document.querySelector(".modalOverlay") || document;
  for (let element of root.querySelectorAll("button,label,a"))
  {
    if (element.classList.contains("tab"))
      elements.push([0, element.title.trim(), element]);
    else if (element.localName == "button")
      elements.push([1, element.textContent.trim(), element]);
    else if (element.localName != "a")
      elements.push([2, element.textContent.trim(), element]);
    else if (!element.classList.contains("iconic-link"))
      elements.push([3, element.textContent.trim() || element.title.trim(), element]);
    else
      elements.push([4, element.textContent.trim() || element.title.trim(), element]);
  }

  elements.sort((a, b) => a[0] - b[0]);

  accessKeys = new Map();

  function findAccessKey(text, element, ...selectors)
  {
    let letters = [];
    for (let i = 0; i < text.length; i++)
      if (!letters.includes(text[i]) && isLetter(text[i]))
        letters.push(text[i]);

    for (let selector of selectors)
    {
      for (let letter of letters)
      {
        if (selector(letter) && !accessKeys.has(letter.toUpperCase()))
        {
          accessKeys.set(letter.toUpperCase(), element);
          return;
        }
      }
    }

    for (let i = 0; i < fallbackKeys.length; i++)
    {
      if (!accessKeys.has(fallbackKeys[i]))
      {
        accessKeys.set(fallbackKeys[i], element);
        return;
      }
    }
  }

  for (let [, text, element] of elements)
    findAccessKey(text, element, isUpperCase, isConsonant, () => true);

  accessKeyHints = [];
  for (let [letter, element] of accessKeys)
  {
    let hint = document.createElement("div");
    hint.className = "accessKeyHint";
    hint.textContent = letter;
    element.parentNode.appendChild(hint);
    hint.style.left = (element.offsetLeft + 5) + "px";
    hint.style.top = (element.offsetTop + (element.offsetHeight - hint.offsetHeight) / 2 - 5) + "px";
    accessKeyHints.push(hint);
  }

  observer = new MutationObserver(hideHints);
  observer.observe(document, {
    childList: true,
    attributes: true,
    subtree: true
  });
}

function hideHints()
{
  if (!accessKeys)
    return;

  accessKeys = null;
  if (accessKeyHints)
  {
    for (let element of accessKeyHints)
      if (element.parentNode)
        element.parentNode.removeChild(element);
  }
  accessKeyHints = null;

  if (observer)
    observer.disconnect();
  observer = null;
}

function triggerHint(event)
{
  let element = accessKeys.get(event.key.toUpperCase());
  if (element)
  {
    event.preventDefault();
    element.click();
  }
}

export default {
  install: function(Vue)
  {
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", onBlur, true);
  }
};
