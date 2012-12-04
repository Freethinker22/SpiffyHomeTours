<section id="mainContent">
    <h1>File Size Matters</h1>

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
            <p>In this tutorial I'll discuss how the size of the image files used in your virtual tour affect the experience the folks who view your tour have and how to reduce the size of those files to create a better experience for them.  Now, when I say file size I don't mean how tall and wide the image is but rather the physical size of the file in Kilobytes, or KB for short.  I'll also use the term MB which stands for Megabytes.  One Megabyte is equal to 1,000 Kilobytes.</p>

            <p><img src="public/img/tutorialImgs/clientServerModel.jpg" id="clientServerModel" alt="Model of the client server relationship" />First off, you need to know that the size of the file that's downloading from the internet affects the speed of the download, the larger the file is, the longer it takes to get on to your computer.  That's a pretty easy concept to understand.  Now what you might not know is every time you visit a web page, all of the text, images, audio, and video have to be downloaded from the site to your web browser to be able to see it.  The image to the right shows the basic process of how a web page is acquired from a server for display in a web browser.  In the case of audio and video, file sizes might be quite large and would take a long time if it were not for streaming.  Streaming means your browser downloads only part of the media before letting it play then continuing to download the rest while you're watching the part that's already downloaded.</p>

            <p class="notes">*The tour I built for Spiffy Home Tours uses a streaming type feature in that the tour only downloads a few pictures before allowing the user to start viewing the tour while continuing to download the rest in the background.  This makes it so your potential clients don't have to wait too long to see the house they're interested in.</p>

            <img src="public/img/tutorialImgs/techStuffWarning.png" id="techStuffWarningSize" alt="Warning! Techy stuff ahead!" />

            <p>In the US, as of 2012, the average download speed is about 5 Mbps (Mbps stands for megabits per second) which ranks about 26th fastest in the world.  Note, megabits are different from megabytes; a byte is equal to 8 bits so 1 MB (megabyte) is equal to 8 Mb (megabits).  What all that nerdy stuff means doesn't really matter as long as you understand that at average download speeds of 5 Mbps, a 1 MB image will take 1.6 seconds to fully download.  Now imagine that your virtual tour has 15 pictures in it with file sizes of around 1 MB.  On the average internet connection that tour would take approximately 24 seconds to fully download.  That's an eternity to someone who just wants to view a web page!  Internet users these days are a very fickle bunch and do not want to wait around for things to load and if the page takes more than several seconds, they will promptly go elsewhere.</p>

            <p>Luckily if you're using my tour, those 24 seconds only takes about 8 because, like I mentioned earlier, the tour only needs to download the first 5 images before allowing the user to start viewing it.  But even an 8 second download is still pushing the outer limits of what most web surfers are willing to tolerate.  Ideally you don't want to make them wait more than 2 seconds for a standard web page and no more than 10 seconds for other media like audio, video, and virtual tours.</p>

            <p>With all that in mind, what can be done to reduce the file size of your images and thus reduce the chance potential viewers will get annoyed and leave the page before viewing your tour?  Well, there are two sure fire methods to reducing file size.  The first is simply making the image smaller.  That is reducing the width and height of the picture.  Fewer pixels equal fewer bytes of data.  The second is reducing the quality of the image.  This is a little trickier than the first because you have to maintain a happy medium of image quality versus file size.</p>

            <p class="notes">*Using a Spiffy Home Tour, the dimensions you'll want to make your images are around 1000 X 700 for pictures that are not panoramas and less than 1 MB in file size.  Panoramas will need to be at least 1300 pixels wide and not any taller than 700 pixels in height.</p>

            <h2>Step 1:</h2>

            <div id="sizeStepOne">
                <p>Reducing the image dimensions using Photoshop is pretty straightforward.  Open the image and under the Image menu in the top bar select Image Size.  The Image Size window will open up and the first thing you'll want to do is make sure the Constrain Proportions check box is checked.  This ensures the image won't be resized disproportionately.  Next, in the box labeled Width, type in the desired width of the image you want.  The height of the image will automatically adjust based off the new width.  Click OK.</p>
                <img src="public/img/tutorialImgs/imageSizePanel.png" id="imageSizePanel" alt="Image size panel" />
                <p class="notes">*Side note, don't use the original image when editing.  Before you open the image in PS, copy the file using copy and paste and use that image for editing.  <strong>Never</strong> edit a photo you don't have backed up!</p>
            </div>

            <h2>Step 2:</h2>

            <p>After resizing your image in Step 1, you'll want to save it for use on the web.  Choose File > Save for Web & Devices.  This will open a window with lots of bells and whistles on it but you only need to worry about a few.  In the upper right hand corner directly beneath the Preset drop menu, there is another drop menu.  Make sure JPEG is selected in that menu.  Directly beneath that menu is yet another drop menu with a number of quality choices in it.  First select Very High from the menu and check to see what the file size is.  The file size is displayed in the lower left hand corner of the window right below the preview image.  If the file size is less than 1 MB, go ahead and save the image.  If not,  play around with the various quality presets until you find one that works but note the quality of the image in the preview window when you reduce the quality.  You'll want to make sure the image still looks good and hasn't started to pixelate.  You can also fine tune the quality and thus the file size with the Quality slider to the right of the quality choices menu.

                <img src="public/img/tutorialImgs/saveForWebPanel.jpg" class="center" id="saveForWebPanel" alt="Save for web panel" /> <!-- redo this image so check boxes are not highlighted in screen shot. Remember to insert in to JS preloader -->

            <p class="notes">*The previous two steps will work the same way in Photoshop Elements 10 with one exception.  The path to Image size is Image > Resize > Image Size.</p>

            <p>Once you have your files resized, both in terms of dimensions and memory size, they're ready for use in the virtual tour.  Remember, the small the file size the faster the tour will download and the happier your tour viewers will be but make sure not to sacrifice too much image quality in the pursuit of quick download times.  If you have any questions, please feel free to <a href="Contact" title="Contact me">contact me</a>.</p>

            <p class="notes">*If you don't have access to Photoshop, Google has a free image editing program called <a href="http://picasa.google.com" target="_blank">Picasa</a> which you can use to reduce the file size of your pictures.  Here is a good <a href="http://www.ehow.com/how_4570888_reduce-photo-file-size.html" target="_blank">tutorial</a> on how to use Picasa to do just that.</p>
        </article>
    </section> <!-- End tutorialWrapper section -->
</section> <!-- End mainContent section -->