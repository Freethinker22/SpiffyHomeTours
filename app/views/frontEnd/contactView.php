<?php
$loadTime = time(); // Initial time that the page loads is checked against the time the form is submitted and if its too fast, its probably a bot
?>
<section id="mainContent">
    <h1>Get In Touch:</h1>
    <p>Please feel free to drop me a line if you have any questions about the site and its services or if your having any issues with your subscription.  You can contact me through the message box below or get a hold of me using my contact info.  E-mail works best for me so I have a chance to get back to my computer if I'm out of my office, but feel free to call if you have any concerns.</p>
    <section id="contactArea">
        <section id="leftCol">
            <form name="contactForm" id="contactForm">
                <div id="inputsWrapper">
                    <div>
                        <label for="fullName">Your Name: <span class="required">(required)</span></label>
                        <input type="text" name="fullName" id="fullName" title="First &amp; last name" value="First &amp; last name" maxlength="50" />
                    </div>
                    <div>
                        <label for="email">Your E-mail: <span class="required">(required)</span></label>
                        <input type="text" name="email" id="email" title="E-mail address" value="E-mail address" maxlength="500" />
                    </div>
                    <div>
                        <label for="subject">In Regards To: <span class="required">(required)</span></label>
                        <input type="text" name="subject" id="subject" title="Subject" value="Subject" maxlength="50"/>
                    </div>
                    <div>
                        <label for="message">Your Message: <span class="required">(required)</span></label>
                        <textarea name="message" id="message" title="Enter your message here" cols="40" rows="10">Enter your message here</textarea>
                    </div>
                    <div>
                        <input type="hidden" name="loadTime" id="loadTime" value="<?php echo $loadTime ?>" maxlenght="50" />
                    </div>
                </div> <!-- End inputsWrapper -->
                <input type="button" name="sendBtn" id="sendBtn" value="Send Message" />
            </form>
        </section> <!-- End leftCol section -->

        <section id="rightCol">
            <h2>Contact Information</h2>
            <p>Matthew Whitehead</p>
            <p>Phone: 785-979-1492</p>
            <p>E-mail: <a href="mailto:M@SpiffyHomeTours.com">M@SpiffyHomeTours.com</a></p> <!-- *** maybe use this email as a public email and have the form based emails sent to one that is not public to avoid spam? *** -->
            <img src="public/img/helloImg.png" alt="Hello Image Graphic" />
        </section> <!-- End rightCol section -->
    </section> <!-- End contactArea section -->
</section> <!-- End mainContent section -->