<section id="mainContent">
    <h1>Pan-O-Rama</h1>

    <section id="tutorialWrapper">
        <aside>
            <ul>
                <li>
                    <a href="Tutorials-light" title="Let There Be Light">Let There Be Light</a>
                </li>
                <li>
                    <a href="Tutorials-panorama" title="Pan-O-Rama">Pan-O-Rama</a>
                </li>
                <li>
                    <a href="Tutorials-best" title="Best in Show">Best in Show</a>
                </li>
                <li>
                    <a href="Tutorials-size" title="File Size Matters">File Size Matters</a>
                </li>
                <li>
                    <a href="Tutorials-megapixel" title="Mega Megapixel Myth">Mega Megapixel Myth</a>
                </li>
            </ul>
        </aside>

        <article>
            <p>This isn't going to be the most definitive guide to building panoramas but I'll touch on most of the basics, from how to properly take the images and stitch them all together, to my recommendations for stitching software and camera equipment.  Shown below is a good example of how a panorama or pano for short should look.</p>

            <img src="public/img/tutorialImgs/panorama.jpg" id="panorama" alt="Image of a panorama" />

            <p>The first trick to getting a good panorama for use in your virtual tour is the way in which you take the pictures.  I'm not talking about how well lit the room is, see the "Best in show" tutorial for tips on lighting, I mean how the camera is setup and turned between shots.  The most important part of shooting a pano is getting a good overlap.  What is that?  Well, when you take the images from your camera and put them into your stitching program, which I'll touch on in just a bit, the software looks for similarities and patterns in the images.  If the outline of a lamp and chair are identical in two separate pictures, then the program knows to blend those two images together.  So, to get the best results you're going to want to use a tripod.  You could do this without a tripod but the outcome won't be nearly as good.  Anyways, the idea is to get at least a 25% overlap.  The more the better, but 50% really is enough for any stitching software that's worth its mettle.</p>  

            <p>Now, what you want to do is…</p>

            <h2>Step 1:</h2>

            <p>Setup your camera on the tripod and get it aimed at what you want to shoot.  Say you want a wide sweeping view of the living room, find a good spot to shoot from, usually a corner, that you think would produce a nice pano and setup the tripod there.  Or stand in that spot if you're going the handheld route.</p>

            <h2>Step 2:</h2>

            <p>Aim your camera so the left edge of the camera's viewer lines up with the left edge of the soon to be panorama you have pictured in your mind.  Before taking the picture, look through the viewer or look at the camera's image preview screen and draw a vertical mental line about 2/3rds of the way across the image in the direction you're going to be turning.  Note the red line on the image below.  This imaginary line is where you'll line up the left edge of the next image if you're turning to the right.  This is a little trick I learned when I first started experimenting with panos.  If you have a tripod with degrees marked on it, you can figure out precisely how many degrees to turn the camera to get a 25% to 50% overlap and avoid the need to draw imaginary lines.</p>

            <img src="public/img/tutorialImgs/panoPart1.jpg" class="center" id="panoPart1" alt="Pano image with red line showing where to line up next image" />

            <h2>Step 3:</h2>

            <p>Press the button and take the picture.  Now, here's where it gets sloppy if you're doing this without a tripod.  Pan the camera to the right, lining up the left edge of the camera's viewer with the imaginary line mentioned earlier.  The blue in the image below shows where the right edge of the previous picture was before panning, note the overlap in the two images.  Once everything is lined up, go ahead and take the picture.  Now if these two images were all you needed to get the panorama you wanted, you'd stop here.  But if you needed to take more pictures, you'd repeat the previous steps by drawing another mental line 2/3rds of the way across the image in the direction you're turning before taking the second picture.  Repeat these steps until you have all the shots you want or you've made yourself dizzy.</p>

            <img src="public/img/tutorialImgs/panoPart2.jpg" class="center" id="panoPart2" alt="Pano image showing what the next shot would look like" />

            <p>Now I as I said earlier, this isn't the end all be all of panorama taking instructions but I hope it shows you that creating your own panos can be fairly quick and easy once you get the hang of it.  Also, if you're really into photography and/or you want a good reason to spend lots of money on camera gear, check out this outrageously in-depth explanation of panoramas by one of my favorite gear suppliers, <a href="http://reallyrightstuff.com/WebsiteInfo.aspx?fc=108" target="_blank">Really Right Stuff</a>.  Now onto the software that brings all of your images together.</p>

            <p>Ok, so in the interest of brevity I'm not going to reinvent the wheel here.  There are many and I do mean many other good tutorials out there on the web right now that explain how to use all kinds of stitching software.  Try Googling "panorama stitching tutorial" and see for yourself.  Any who, the software I like and have always used is Photoshop.  Photoshop is in my, and many others opinion, the best photo editing software on the market.  It also has a feature built into it called Photomerge which is used for creating panoramas.  The really wonderful thing about having Photoshop is not only do you get photo editing software, but along with it comes the software to create panos.  If you were to use free image editing software such as Google's Picasa, you would also have to purchase stitching software.</p>

            <p class="notes">*By the way, Photomerge is available in both the full version of Photoshop and in Photoshop Elements 10.</p>

            <p><img src="public/img/tutorialImgs/photomergeImg.png" id="photomergeImg" alt="Image of photomerge window" />What you'll want to next is get Photomerge fired up; it's under Automate in the File menu in PS CS5 and in PS Elements you can find it by following File &gt; New &gt; Photomerge Panorama.  You then browse for and select the images you want turned into a panorama and click OK.  The program is pretty resource intensive so it'll slow your computer down while it processes the files.  I would recommend closing any unnecessary applications you might have running before starting.  Once the program gets done processing the images, the results from Photomerge can be a little rough.  Due to the way the program puts the pictures together and aligns them, the results can have a really funky shape that will require some cropping.  This is easily accomplished with the aptly named cropping tool.</p>

            <p><img src="public/img/tutorialImgs/savingImg.png" id="savingImg" alt="Image of save window" />Once cropped, you can proportionally resize the image using the Image Size feature under the Image menu.  I would recommend doing this with any pictures you plan on using in a virtual tour because it helps keep the file size down.  And while on the topic of file size, one of the super spiffy features of Photoshop is it lets you chose the quality of your image when saving it for the first time or resaving it under a different name.  You'll want to save your images as a JPG files by the way.  By not choosing the highest possible quality for your pano you can keep the file size smaller and thus decrease the amount of time the picture would take to load in the tour.  This is very important if you want to keep your potential viewers content.  There exists a happy medium for the ratio of quality to file size and it's really down to how sharp you want the images.  For the most part keeping them around or below 1MB (megabyte) will help keep your tours loading fast and keep your viewers from running away due to the page taking too long to load.</p>

            <p class="notes">*For more on resizing your image files, see the File Size Matters tutorial.</p>

            <p>In closing, I hope you'll consider taking your own panoramas for your virtual tours.  They're a great way to show off a whole room and there pretty easy to create once you get the basis down.  As of right now the virtual tour I've built for this site doesn't handle full 360 degree panos yet but it's on the list of features to add.  It does however support vertical panoramas.  You can create those using the same techniques as you use for the horizontal ones.  Finally, and like I mentioned earlier, this page was not designed to be a full tutorial for taking panoramas but rather some info to get you to think about taking your own so you can use them in your marketing.  I would recommend doing some more research and reading on the subject if you're interested but I hope I provided some useful tips to get you started.</p>
        </article>
    </section> <!-- End tutorialWrapper section -->
</section> <!-- End mainContent section -->