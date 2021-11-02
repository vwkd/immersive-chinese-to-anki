# Card-Type


### Introduction

- Card Type "IC"
- Basic Note Type
- Create a new Options preset "IC" and save it for all subdecks of "IC". You might want to enable "Don't play audio automatically" such that it doesn't play both audios if available.

### Front Template

- plays fast audio automatically
- note, doesn't work in AnkiWeb in browsers where autoplay is blocked, e.g. Safari

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

{{#Notes}}
<div class="header">
<span>note</span>
</div>

<div class="box note">{{Notes}}</div>
{{/Notes}}

<div class="audio">
<span class="fast">[sound:{{Audio}}]</span>
<span class="slow">[sound:{{Audio slow}}]</span>
</div>

</div>

<script>
// autoplay fast audio, only on front template

// desktop
var anchor = document.querySelector(".fast .replay-button");
if (anchor) { anchor.click(); }

// browser
// note, doesn't work if autoplay is blocked like in Safari
var audio = document.querySelector(".fast audio");
if (audio) { audio.play(); }
</script>
```

### Back Template

```
<div class="id">{{ID}}</div>

<div class="box content">
  <div class="pinyin">{{Pinyin}}</div>
  <hr>
  <div class="hanzi">{{Traditional}}</div>
  <hr>
  <div>{{English}}</div>
</div>

{{#Notes}}
<div class="header">
<span>note</span>
</div>

<div class="box note">{{Notes}}</div>
{{/Notes}}

<div class="audio">
<span class="fast">[sound:{{Audio}}]</span>
<span class="slow">[sound:{{Audio slow}}]</span>
</div>
```

### Styling

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

.header span {
  background-color: #46b4dd;
  padding: 0.2rem 0.5rem;
  border-radius: 3px 10px;
  color: white;
}

.note {
  padding: 0.5rem;
  border-radius: 0.3rem;
  /* font-weight: 300; */
}

.audio {
  display: flex;
  align-items: center;
  /* can't center the big blue button because in browser uses audio element */
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

.audio .fast .replay-button svg {
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
