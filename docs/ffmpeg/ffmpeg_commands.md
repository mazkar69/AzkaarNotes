# FFmpeg Complete Command Reference

Commands from the course **"FFmpeg - The Complete Guide"** by Syed Andaleeb Roomy.  
[Udemy Course Link](https://www.udemy.com/course/ffmpeg-the-complete-guide/?referralCode=1B0CDEEB984838103727)

## Table of Contents
1. [Tools for Probing and Playing](#section-2-tools-for-probing-and-playing)
2. [FFmpeg Concepts](#section-4-ffmpeg-concepts)
3. [Encoding](#section-5-encoding)
4. [Streaming](#section-6-streaming)
5. [Video Manipulation Examples](#section-7-video-manipulation-examples)
6. [Audio Manipulation Examples](#section-8-audio-manipulation-examples)

---

## Section 2: Tools for Probing and Playing

### Inspecting with ffprobe

```sh
# Basic probe
ffprobe seagull.mp4

# Show format info only (suppress banner)
ffprobe -v error seagull.mp4 -show_format

# Show format and streams
ffprobe -v error seagull.mp4 -show_format -show_streams

# Output as JSON
ffprobe -v error seagull.mp4 -show_format -show_streams -print_format json

# Select video streams only
ffprobe -v error seagull.mp4 -show_streams -select_streams v

# Get specific stream entries
ffprobe -v error seagull.mp4 -show_streams -select_streams v -show_entries stream=codec_name

# Clean output (no wrappers, no key)
ffprobe -v error seagull.mp4 -select_streams v -show_entries stream=codec_name -print_format default=noprint_wrappers=1:nokey=1

# Get format long name
ffprobe -v error seagull.mp4 -show_entries format=format_long_name -print_format default=noprint_wrappers=1:nokey=1

# Probe remote URL
ffprobe -v error https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_10MB.mp4 -show_format -show_streams -print_format json
```

### Playing with ffplay

```sh
# Basic playback
ffplay -v error bullfinch.mp4

# Set window size
ffplay -v error bullfinch.mp4 -x 600 -y 600

# Borderless window
ffplay -v error bullfinch.mp4 -x 600 -y 600 -noborder

# Scale by height only (maintain aspect)
ffplay -v error bullfinch.mp4 -y 600 -noborder

# Position window
ffplay -v error bullfinch.mp4 -y 600 -noborder -top 0 -left 0

# Fullscreen
ffplay -v error bullfinch.mp4 -y 600 -noborder -fs

# Disable audio
ffplay -v error bullfinch.mp4 -y 600 -noborder -an

# Disable video (audio only)
ffplay -v error bullfinch.mp4 -y 600 -noborder -vn

# Show audio waveform
ffplay -v error bullfinch.mp4 -y 600 -noborder -vn -showmode waves

# Loop playback
ffplay -v error bullfinch.mp4 -y 600 -noborder -loop 0

# Play audio with waveform
ffplay -v error birds-forest.ogg -showmode waves

# Display image
ffplay -v error kingfisher.jpg

# Play remote URL
ffplay -v error https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4 -noborder -y 600
```

---

## Section 4: FFmpeg Concepts

### Inputs and Outputs

```sh
# List supported protocols
ffmpeg -protocols

# List devices
ffmpeg -devices

# List formats
ffmpeg -formats
```

### Stream Selection

```sh
# Inspect multitrack file
ffprobe multitrack.mp4 -v error -show_format -show_streams -print_format json

# Default stream selection (one video, one audio)
ffmpeg -v error -y -i multitrack.mp4 -to 1 multitrack-1s.mp4

# Select all streams
ffmpeg -v error -y -i multitrack.mp4 -to 1 -map 0 multitrack-1s.mp4

# Select only video streams
ffmpeg -v error -y -i multitrack.mp4 -to 1 -map 0:v multitrack-1s.mp4

# Select by stream index
ffmpeg -v error -y -i multitrack.mp4 -to 1 -map 0:0 multitrack-1s.mp4

# Select only audio streams
ffmpeg -v error -y -i multitrack.mp4 -to 1 -map 0:a multitrack-1s.mp4

# Select first audio stream
ffmpeg -v error -y -i multitrack.mp4 -to 1 -map 0:a:0 multitrack-1s.mp4

# Map from multiple inputs
ffmpeg -v error -y -i multitrack.mp4 -i second-input.mp4 -to 1 -map 1:v:0 -map 0:a:1 multitrack-1s.mp4
```

### Filter Graphs

```sh
# Complex video filter graph
ffmpeg -v error -y -i bullfinch.mp4 \
  -vf "split[bg][ol];[bg]scale=width=1920:height=1080,format=gray[bg_out];[ol]scale=-1:480,hflip[ol_out];[bg_out][ol_out]overlay=x=W-w:y=(H-h)/2" \
  ol.mp4

# Complex audio filter graph
ffmpeg -y -i four_channel_stream.wav \
  -af "asplit=2[voice][bg];[voice]volume=volume=2,pan=mono|c0=c0+c1[voice_out];[bg]volume=volume=0.5,pan=mono|c0=c2+c3[bg_out];[voice_out][bg_out]amerge=inputs=2" \
  audio_out.wav

# Multiple outputs from one input
ffmpeg -v error -y -i bullfinch.mp4 -i ffmpeg-logo.png \
  -filter_complex "[1:v]scale=-1:200[small_logo];[0:v][small_logo]overlay=x=W-w-50:y=H-h-50,split=2[sd_in][hd_in];[sd_in]scale=-2:480[sd];[hd_in]scale=-2:1080[hd];[0:a]pan=stereo|FL=c0+c2|FR=c1+c3[stereo_mix]" \
  -map "[sd]" sd.mp4 \
  -map "[hd]" hd.mp4 \
  -map "[stereo_mix]" stereo_mix.mp3
```

---

## Section 5: Encoding

### Encoding Basics

```sh
# Check source codec
ffprobe -v error bullfinch.mov -select_streams v -show_entries stream=codec_name -print_format default=noprint_wrappers=1

# Transcode to different container
ffmpeg -v error -y -i bullfinch.mov transcoded.mxf

# Transcode to mp4
ffmpeg -v error -y -i bullfinch.mov transcoded.mp4

# Specify video codec
ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 transcoded.mxf

# List available encoders
ffmpeg -encoders

# Use VP9 codec
ffmpeg -v error -y -i bullfinch.mov -vcodec libvpx-vp9 transcoded.mp4

# Specify both video and audio codec
ffmpeg -v error -y -i bullfinch.mov -vcodec libvpx-vp9 -acodec libmp3lame transcoded.mp4
```

### H.264 / AVC Encoding

```sh
# Check bitrate
ffprobe -v error bullfinch.mov -select_streams v -show_entries stream=codec_name,bit_rate -print_format default=noprint_wrappers=1

# Default H.264 encoding
ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 transcoded.mp4

# CRF Quality Control (lower = better quality, larger file)
ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 -crf 10 transcoded.mp4   # High quality
ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 -crf 45 transcoded.mp4   # Low quality

# Target Bitrate (CBR-like)
ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 -b:v 2M transcoded.mp4

# Two-Pass Encoding (better quality at target bitrate)
ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 -b:v 2M -pass 1 -f null /dev/null
ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 -b:v 2M -pass 2 transcoded.mp4

# Preset Speed vs Compression
time ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 transcoded.mp4                    # Default
time ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 -preset ultrafast transcoded.mp4  # Fastest
time ffmpeg -v error -y -i bullfinch.mov -vcodec libx264 -preset slow transcoded.mp4       # Better compression
```

---

## Section 6: Streaming

### Fast Start for Progressive Download

```sh
# Create test video
ffmpeg -f lavfi -i testsrc=duration=5 test.mp4

# Check atom order (mdat before moov = not fast-started)
ffmpeg -v trace -i test.mp4 2>&1 | grep -e type:\'mdat\' -e type:\'moov\'

# Add fast start (move moov before mdat)
ffmpeg -i test.mp4 -movflags +faststart -c copy test-fast-started.mp4

# Verify fast start
ffmpeg -v trace -i test-fast-started.mp4 2>&1 | grep -e type:\'mdat\' -e type:\'moov\'

# Create with fast start directly
ffmpeg -y -f lavfi -i testsrc=duration=5 -movflags +faststart test-2.mp4
```

### Streaming Protocols

```sh
# Play HTTP stream
ffplay -v quiet -y 200 "<the-http-url>"

# RTMP streaming
ffmpeg -v quiet -i "<the-http-url>" \
  -vf "scale=-2:200,drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=RTMP:fontsize=30:x=10:y=20:fontcolor=#000000:box=1:boxborderw=5:boxcolor=#ff888888" \
  -vcodec libx264 -f flv rtmp://localhost:1935/live/rtmpdemo

ffplay -v quiet rtmp://localhost:1935/live/rtmpdemo

# SRT streaming
ffmpeg -v quiet -i rtmp://localhost:1935/live/rtmpdemo \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=SRT:fontsize=30:x=10:y=60:fontcolor=#000000:box=1:boxborderw=5:boxcolor=#ff888888" \
  -vcodec libx264 -f mpegts srt://localhost:1935?streamid=input/live/srtdemo

ffplay -v quiet srt://localhost:1935?streamid=output/live/srtdemo

# HTTP DASH upload
ffmpeg -v quiet -i srt://localhost:1935?streamid=output/live/srtdemo \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=HTTP:fontsize=30:x=10:y=100:fontcolor=#000000:box=1:boxborderw=5:boxcolor=#ff888888" \
  -vcodec libx264 -f dash -method PUT http://localhost/live/httpdemo.mpd
```

#### Docker Commands for RTMP/SRT Servers
```sh
# RTMP server
docker run -d -p 1935:1935 tiangolo/nginx-rtmp

# SRT server
docker run -d -p 1935:1935/udp ravenium/srt-live-server
```

### HLS & DASH with FFmpeg

#### HLS with TS segments (Audio + Video muxed)
```sh
ffmpeg -y -i nature.mp4 -to 10 \
  -filter_complex "[0:v]fps=30,split=3[720_in][480_in][240_in];[720_in]scale=-2:720[720_out];[480_in]scale=-2:480[480_out];[240_in]scale=-2:240[240_out]" \
  -map "[720_out]" -map "[480_out]" -map "[240_out]" -map 0:a -map 0:a -map 0:a \
  -b:v:0 3500k -maxrate:v:0 3500k -bufsize:v:0 3500k \
  -b:v:1 1690k -maxrate:v:1 1690k -bufsize:v:1 1690k \
  -b:v:2 326k -maxrate:v:2 326k -bufsize:v:2 326k \
  -b:a:0 128k -b:a:1 96k -b:a:2 64k \
  -x264-params "keyint=60:min-keyint=60:scenecut=0" \
  -var_stream_map "v:0,a:0,name:720p-4M v:1,a:1,name:480p-2M v:2,a:2,name:240p-500k" \
  -hls_time 2 -hls_list_size 0 \
  -hls_segment_filename adaptive-%v-%03d.ts \
  -master_pl_name adaptive.m3u8 adaptive-%v.m3u8
```

#### HLS with TS segments (Shared audio track)
```sh
ffmpeg -y -i nature.mp4 -to 10 \
  -filter_complex "[0:v]fps=30,split=3[720_in][480_in][240_in];[720_in]scale=-2:720[720_out];[480_in]scale=-2:480[480_out];[240_in]scale=-2:240[240_out]" \
  -map "[720_out]" -map "[480_out]" -map "[240_out]" -map 0:a \
  -b:v:0 3500k -maxrate:v:0 3500k -bufsize:v:0 3500k \
  -b:v:1 1690k -maxrate:v:1 1690k -bufsize:v:1 1690k \
  -b:v:2 326k -maxrate:v:2 326k -bufsize:v:2 326k \
  -b:a:0 128k \
  -x264-params "keyint=60:min-keyint=60:scenecut=0" \
  -var_stream_map "a:0,agroup:a128,name:audio-128k v:0,agroup:a128,name:720p-4M v:1,agroup:a128,name:480p-2M v:2,agroup:a128,name:240p-500k" \
  -hls_time 2 -hls_list_size 0 \
  -hls_segment_filename adaptive-%v-%03d.ts \
  -master_pl_name adaptive.m3u8 adaptive-%v.m3u8
```

#### HLS with fMP4 segments
```sh
ffmpeg -y -i nature.mp4 -to 10 \
  -filter_complex "[0:v]fps=30,split=3[720_in][480_in][240_in];[720_in]scale=-2:720[720_out];[480_in]scale=-2:480[480_out];[240_in]scale=-2:240[240_out]" \
  -map "[720_out]" -map "[480_out]" -map "[240_out]" -map 0:a \
  -b:v:0 3500k -maxrate:v:0 3500k -bufsize:v:0 3500k \
  -b:v:1 1690k -maxrate:v:1 1690k -bufsize:v:1 1690k \
  -b:v:2 326k -maxrate:v:2 326k -bufsize:v:2 326k \
  -b:a:0 128k \
  -x264-params "keyint=60:min-keyint=60:scenecut=0" \
  -var_stream_map "a:0,agroup:a128,name:audio-128k v:0,agroup:a128,name:720p-4M v:1,agroup:a128,name:480p-2M v:2,agroup:a128,name:240p-500k" \
  -hls_segment_type fmp4 \
  -hls_time 2 -hls_list_size 0 \
  -hls_fmp4_init_filename adaptive-%v-init.m4s \
  -hls_segment_filename adaptive-%v-%03d.m4s \
  -master_pl_name adaptive.m3u8 adaptive-%v.m3u8
```

#### DASH with fMP4
```sh
ffmpeg -y -i nature.mp4 -to 10 \
  -filter_complex "[0:v]fps=30,split=3[720_in][480_in][240_in];[720_in]scale=-2:720[720_out];[480_in]scale=-2:480[480_out];[240_in]scale=-2:240[240_out]" \
  -map "[720_out]" -map "[480_out]" -map "[240_out]" -map 0:a \
  -b:v:0 3500k -maxrate:v:0 3500k -bufsize:v:0 3500k \
  -b:v:1 1690k -maxrate:v:1 1690k -bufsize:v:1 1690k \
  -b:v:2 326k -maxrate:v:2 326k -bufsize:v:2 326k \
  -b:a:0 128k \
  -x264-params "keyint=60:min-keyint=60:scenecut=0" \
  -seg_duration 2 \
  adaptive.mpd
```

#### Combined HLS + DASH
```sh
ffmpeg -y -i nature.mp4 -to 10 \
  -filter_complex "[0:v]fps=30,split=3[720_in][480_in][240_in];[720_in]scale=-2:720[720_out];[480_in]scale=-2:480[480_out];[240_in]scale=-2:240[240_out]" \
  -map "[720_out]" -map "[480_out]" -map "[240_out]" -map 0:a \
  -b:v:0 3500k -maxrate:v:0 3500k -bufsize:v:0 3500k \
  -b:v:1 1690k -maxrate:v:1 1690k -bufsize:v:1 1690k \
  -b:v:2 326k -maxrate:v:2 326k -bufsize:v:2 326k \
  -b:a:0 128k \
  -x264-params "keyint=60:min-keyint=60:scenecut=0" \
  -hls_playlist 1 \
  -hls_master_name adaptive.m3u8 \
  -seg_duration 2 \
  adaptive.mpd
```

---

## Section 7: Video Manipulation Examples

### Trimming

```sh
# Trim by start time and end time
Syntax:- ffmpeg -y -v error -i <input> -ss <start_time> -to <end_time> <output>
Example:- ffmpeg -y -v error -i nature.mp4 -ss 00:03:55.000 -to 240.0 squirrel.mp4

# Trim by start time and duration
Syntax:- ffmpeg -y -v error -i <input> -ss <start_time> -t <duration> <output>
Example:- ffmpeg -y -v error -i nature.mp4 -ss 00:03:55.000 -t 5 squirrel2.mp4
```

### Merging / Concatenation

```sh
# Create list file (list.txt)
file 'bullfinch-5s.mp4'
file 'seagull-5s.mp4'
file 'squirrel.mp4'

# Concatenate files
ffmpeg -y -v error -f concat -i list.txt merged.mp4
```

### Generating Thumbnails

```sh
# Extract single frame (poster)
ffmpeg -v error -i bullfinch.mp4 -vframes 1 bullfinch-poster-frame.jpg

# Extract and resize thumbnail
ffmpeg -v error -i bullfinch.mp4 -vframes 1 -vf scale=320:180 bullfinch-thumbnail.jpg

# Extract frame at specific time
ffmpeg -v error -i bullfinch.mp4 -ss 5 -vframes 1 -vf scale=320:180 bullfinch-thumbnail-at-5s.jpg

# Extract multiple thumbnails (1 per second)
ffmpeg -v error -i bullfinch.mp4 -vf fps=1,scale=320:180 bullfinch-thumbnail-%02d.jpg
```

### Scaling / Resizing

```sh
# Scale to specific dimensions
ffmpeg -v error -y -i cow_4k.mp4 -vf scale=1280:720 cow_720p.mp4

# Scale with aspect ratio preserved (-1 = auto calculate)
ffmpeg -v error -y -i cow_4k.mp4 -vf scale=-1:480 cow_480_aspect_preserved.mp4

# Use -2 to ensure even dimensions (required for some codecs)
ffmpeg -v error -y -i cow_4k.mp4 -vf scale=-2:480 cow_480_aspect_preserved.mp4

# Force aspect ratio with padding (letterbox/pillarbox)
ffmpeg -v error -y -i cow_4k.mp4 \
  -vf "scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2" \
  cow_480_aspect_forced_and_padded.mp4
```

### Overlay / Watermark

```sh
# Basic overlay (top-left)
ffmpeg -v error -y -i bullfinch.mp4 -i ffmpeg-logo.png -filter_complex "overlay" out.mp4

# Position overlay (top-right with padding)
ffmpeg -v error -y -i bullfinch.mp4 -i ffmpeg-logo.png \
  -filter_complex "overlay=x=main_w-overlay_w-50:y=50" out.mp4

# Transparent overlay
ffmpeg -v error -y -i bullfinch.mp4 -i ffmpeg-logo.png \
  -filter_complex "[1:v]colorchannelmixer=aa=0.4[transparent_logo];[0:v][transparent_logo]overlay=x=main_w-overlay_w-50:y=50" \
  out.mp4

# Resize overlay before applying
ffmpeg -v error -y -i bullfinch.mp4 -i ffmpeg-logo.png \
  -filter_complex "[1:v]scale=-1:100[smaller_logo];[0:v][smaller_logo]overlay=x=main_w-overlay_w-50:y=50" \
  out.mp4

# Multiple overlays
ffmpeg -v error -y -i bullfinch.mp4 -i ffmpeg-logo.png -i tux.png \
  -filter_complex "[1:v]scale=-1:100[smaller_logo];[0:v][smaller_logo]overlay=x=main_w-overlay_w-50:y=50[after_one_logo];[after_one_logo][2:v]overlay=W-w-50:H-h-50" \
  out.mp4

# Picture-in-picture (video overlay)
ffmpeg -v error -y -i bullfinch.mp4 -i ffmpeg-logo.png -i squirrel.mp4 \
  -filter_complex "[1:v]scale=-1:100[smaller_logo];[0:v][smaller_logo]overlay=x=main_w-overlay_w-50:y=50[after_one_logo];[2:v]scale=-1:400[smaller_squirrel];[after_one_logo][smaller_squirrel]overlay=W-w-50:H-h-50" \
  out.mp4
```

### Drawing Text or Timecode

```sh
# Basic text
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=Birds"

# Styled text
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=Birds:fontsize=48:x=100:y=100"

# Centered text (dynamic sizing)
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=Birds:fontsize=h/2:x=(w-text_w)/2:y=(h-text_h)/2"

# Colored text
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=Birds:fontsize=h/2:x=(w-text_w)/2:y=(h-text_h)/2:fontcolor=green"

# Semi-transparent text
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=Birds:fontsize=h/2:x=(w-text_w)/2:y=(h-text_h)/2:fontcolor=#000000AA"

# Text visible only during specific time
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=Birds:fontsize=h/2:x=(w-text_w)/2:y=(h-text_h)/2:fontcolor=#000000AA:enable='between(t,1,3)'"

# Animated/scrolling text
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=Birds:fontsize=h/2:x=(w-text_w)/2:y=(h-t*200):fontcolor=#000000AA"

# Timecode overlay
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=:fontsize=60:x=(w-text_w)/2:y=(h-100):fontcolor=#000000:timecode='10\:00\:00\:00':rate=30000/1001"

# Timecode with background box
ffplay bullfinch.mp4 -v error -an \
  -vf "drawtext=fontfile='c\:/Windows/Fonts/courbd.ttf':text=:fontsize=60:x=(w-text_w)/2:y=(h-100):fontcolor=#000000:timecode='10\:00\:00\:00':rate=30000/1001:box=1:boxborderw=15:boxcolor=#ffffff44"
```

---

## Section 8: Audio Manipulation Examples

### Separating Channels

```sh
# Check audio stream info
ffprobe -v error two-stereo-tracks.m4a -select_streams a -show_entries stream=index,codec_name,channels -print_format json

# Merge two stereo tracks into one 4-channel stream
ffmpeg -y -v error -i two-stereo-tracks.m4a -filter_complex "amerge=inputs=2" four-channels-one-stream.m4a

# Split 4-channel stream into separate mono files
ffmpeg -y -v error -i two-stereo-tracks.m4a \
  -filter_complex "amerge=inputs=2,asplit=4[all0][all1][all2][all3];[all0]pan=mono|c0=c0[ch0];[all1]pan=mono|c0=c1[ch1];[all2]pan=mono|c0=c2[ch2];[all3]pan=mono|c0=c3[ch3]" \
  -map "[ch0]" ch0.m4a \
  -map "[ch1]" ch1.m4a \
  -map "[ch2]" ch2.m4a \
  -map "[ch3]" ch3.m4a
```

### Mixing Channels

```sh
# Merge multiple mono files into multi-channel stream
ffmpeg -v error -y -i ch0.m4a -i ch1.m4a -i ch2.m4a -i ch3.m4a \
  -filter_complex "amerge=inputs=4" one-stream-four-channels.m4a

# Mix multiple inputs into single mono channel
ffmpeg -v error -y -i ch0.m4a -i ch1.m4a -i ch2.m4a -i ch3.m4a \
  -filter_complex "amix=inputs=4" one-stream-one-channel.m4a

# Pan/mix to mono with equal weights
ffmpeg -v error -y -i ch0.m4a -i ch1.m4a -i ch2.m4a -i ch3.m4a \
  -filter_complex "amerge=inputs=4,pan=mono|c0=c0+c1+c2+c3" pan-mono.m4a

# Pan/mix to mono with custom weights
ffmpeg -v error -y -i ch0.m4a -i ch1.m4a -i ch2.m4a -i ch3.m4a \
  -filter_complex "amerge=inputs=4,pan=mono|c0=0.5*c0+2*c1+0.5*c2+2*c3" pan-mono-weighted.m4a

# Pan/mix to stereo
ffmpeg -v error -y -i ch0.m4a -i ch1.m4a -i ch2.m4a -i ch3.m4a \
  -filter_complex "amerge=inputs=4,pan=stereo|FL=c0+c2|FR=c1+c3" pan-stereo.m4a
```

---

## Quick Reference

### Common Flags

| Flag | Description |
|------|-------------|
| `-v error` | Suppress output except errors |
| `-y` | Overwrite output without asking |
| `-i` | Input file |
| `-c copy` | Copy streams without re-encoding |
| `-an` | Disable audio |
| `-vn` | Disable video |
| `-ss` | Start time (seek) |
| `-to` | End time |
| `-t` | Duration |
| `-vf` | Video filter |
| `-af` | Audio filter |
| `-map` | Select streams |

### CRF Quality Guide (H.264)

| CRF | Quality | Use Case |
|-----|---------|----------|
| 0 | Lossless | Archival |
| 18 | Visually lossless | High quality |
| 23 | Default | Good balance |
| 28 | Lower quality | Web streaming |
| 51 | Worst | Not recommended |

### Preset Speed vs Size (H.264)

| Preset | Speed | File Size |
|--------|-------|-----------|
| ultrafast | Fastest | Largest |
| fast | Fast | Large |
| medium | Default | Medium |
| slow | Slow | Small |
| veryslow | Slowest | Smallest |
