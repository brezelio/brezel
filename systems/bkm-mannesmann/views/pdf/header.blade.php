<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <title>header</title>
    <style>
        html {
            font-family: 'TeX Gyre Heros', serif;

        }

        body {
            font-family: sans-serif;
            font-size: 12px;
            height: 50mm;
            margin: 0;
            padding: 0;
            width: 100%;
            background-color: aqua;

        }
        .top_main {
        width: 100%;
        background-color: pink;
        position: relative;
        height: 38mm;
      }
      .section_top_left {
        background-color: red;
        position: absolute;
        width: 60%;
      }
      .section_top_right {
        background-color: grey;
        position: absolute;
        right: 6mm;
        height: 40mm;
      }
      .class_sauerland{
        font-size:20px;
        text-align:center;
         text-transform: uppercase;
      }
      .section_top_right_details{
        margin-left:10px;
        font-size:18px;
      }
      .section_top_right_icons{
        color:green;
  
      }

        td {
            vertical-align: middle;
        }
    </style>
</head>
<body>
<section class="top_main">
      <section class="section_top_left">left</section>
      <section class="section_top_right">
        <div class="class_sauerland">Bwa Sauerland gmbh </div>
        <div class="section_top_right_details">
        <span class="section_top_right_icons" style="font-size:16px">&#127760</span> Peter-Dassis-Ring 40a, 57482 Wenden
        <br />
        <span class="section_top_right_icons" style="font-size:16px">&#128222</span> 02762-98 19 499
        <br />
        <span class="section_top_right_icons"style="font-size:20px" > &#x2709</span> info@bwa-sauerland.de
        <div>
      </section>
    </section>
<hr>
</body>
</html>
