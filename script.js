var audioContext, audio, file, files, WIDTH, HEIGHT, src, anyl;

    window.onload = function(){
      // create the canvas and set basic demmensions and 2d context
      var canvas = document.getElementById("canvas");
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      var ctx = canvas.getContext("2d");

      console.log('start up with variables initialized');

      
      /** tinygradient and tinycolor
        * THESE ARE NOT MY FUNCTIONS OR CODE, FREE USE FROM MIT
        * FOUND HERE: https://github.com/mistic100/tinygradient
        * using to create color gradient
       **/
      var gradient = tinygradient( 'purple','blue','green','yellow' ,'orange','red');
      var n = 256;
      var colors = gradient.hsv(n, true);

      // make the canvas all black
      //console.log(colors[100].toRgbString());
      ctx.fillRect(0, 0, canvas.width, canvas.height);


      // link our variables with html elements
      var file = document.getElementById("thefile");
      var audio = document.getElementById("audio");
      var range = document.getElementById("myRange");
      var stepSize = range.value;

      
      range.oninput = function(){
        stepSize = this.value;
        console.log(stepSize);
        file.onchange();
      }

      // activates when asong is chosen from the file browser
      file.onchange = function(){

        files = this.files; // files of "file" class made earlier

        /** Audio Source
          * the audio for the html element is linked to the file
          * - from the file browser element
          * "The URL interface represents an object providing static
          * methods used for creating object URLs."
          * "creates a source from an <audio> element"
         **/
        audio.src = URL.createObjectURL(files[0]);
        audio.load();
        audio.play();
        var audioContext = new AudioContext();
        var src = audioContext.createMediaElementSource(audio);

        /** Analizer for audioContext
          * creates an AnalyserNode, which can be used to expose
          * audio time and frequency data
        **/
        var anyl = audioContext.createAnalyser();
        anyl.connect(audioContext.destination);
        src.connect(anyl);

        /** FFT (Fast Fourier Transform)
          * higher number for "more detail" in frequency domain
          http://support.ircam.fr/docs/AudioSculpt/3.0/co/FFT%20Size.html
          * it divides the window into equal strips or "bins"
         **/
        anyl.fftSize = Math.pow(2, stepSize);
        //anyl.fftSize = 512;

        /**
          * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
          * sums it up really well and all componenets
          * NOTE: now that anyl has been split into 2^##, we have that many
          * - frequencies in the array dataArray.length() = the above #
         **/
        var bufferLength = anyl.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength); // Uint not Unit goddamit

        console.log("BufferLength: "+ bufferLength);
        console.log("dataArray Length: " + dataArray.length);

        // the variables to be used in draw
        var x = 0;
        var freqHeight;
        var freqWidth = (1.5 * canvas.width)/bufferLength;
        var avgColor = 0;
        var temp = 0;
        /** Draw() Function
          * will be used to actually draw the bars representing the freq strengths
          * color and height of each will be determined here
         **/
        function draw(){
          drawVisual = requestAnimationFrame(draw);
          anyl.getByteFrequencyData(dataArray);
          x=0;

          ctx.fillStyle = colors[Math.ceil(avgColor/bufferLength)].toRgbString();
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          avgColor = 0;
          //var temp = 0;


          // need to loop through all frequencies
          // 255 is max freqHeight output since 8-bits
          for(var i = 0; i < bufferLength; i++){
            temp = dataArray[i];
            freqHeight = temp;
            temp = temp/255;

            if(freqHeight > 0)
              avgColor += freqHeight;

            // Now we need to choose the color for each depending on size
            ctx.fillStyle = colors[freqHeight].toRgbString();
            ctx.fillRect(x, canvas.height - (temp*canvas.height), freqWidth, temp*canvas.height);
            x += 1+ freqWidth;
          }
        };
          audio.play();
          draw();
      }
    }