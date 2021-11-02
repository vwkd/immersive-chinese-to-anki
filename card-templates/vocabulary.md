# Vocabulary Card Type



## Introduction

- copy of Note Type `Basic`
- fields: ID, Simplified, Traditional, Pinyin, English, Audio
- note, use together with Deck Option that disables automatic audio play



## Front Template

- plays audio automatically
- note, doesn't work in AnkiWeb in browsers where autoplay is blocked, e.g. Safari
- note, uses traditional characters, can use simplified instead

```html
<div class="wrapper">

<div class="id">{{ID}}</div>

<div class="box content">
  <div class="pinyin">{{Pinyin}}</div>
  <hr>
  <div class="hanzi">{{Traditional}}</div>
  <hr>
  <div>{{English}}</div>
</div>

<div class="audio">[sound:{{Audio}}]</div>

</div>

<script>
// autoplay audio, only on front template

// desktop
var anchor = document.querySelector(".audio .replay-button");
if (anchor) { anchor.click(); }

// browser
// note, doesn't work if autoplay is blocked like in Safari
var audio = document.querySelector(".audio audio");
if (audio) { audio.play(); }
</script>
```



## Back Template

- note, uses traditional characters, can use simplified instead

```html
<div class="id">{{ID}}</div>

<div class="box content">
  <div class="pinyin">{{Pinyin}}</div>
  <hr>
  <div class="hanzi">{{Traditional}}</div>
  <hr>
  <div>{{English}}</div>
</div>

<div class="audio">[sound:{{Audio}}]</div>
```



## Styling

```css
/* light mode (default) */

.card {
  background-color: #eaf0f4;
  color: #215c70;
  font-family: "Helvetica Neue";
  padding: 1rem;
}

.wrapper {
  display: flex;
  flex-direction: column;
  /* not supported on desktop */
  /* gap: 1rem; */
}

.id {
  text-align: center;
  font-size: small;
  color: grey;
  margin-bottom: 1rem;
}

.box {
  background-color: white;
  margin-bottom: 1rem;
}

.content {
  font-weight: 500;
  padding: 1rem;
  border-radius: 0.6rem;
}

.hanzi {
}

.pinyin {
}

.header {
  margin-bottom: 1rem;
}

.audio {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* audio on desktop */
.audio .replay-button svg circle {
  fill: #46b4dd;
  stroke: #46b4dd;
}

.audio .replay-button svg path {
  fill: white;
}

.audio .replay-button svg {
  width: 100px;
  height: 100px;
}

/* dark mode */

.nightMode.card {
  background-color: black;
  color: white;
}

.nightMode .box {
  background-color: #1c1c1e;
}
```
