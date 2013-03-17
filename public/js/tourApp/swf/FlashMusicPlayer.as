package
{
	import flash.display.Sprite;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.net.URLRequest;
	import flash.external.ExternalInterface;
	
	public class FlashMusicPlayer extends Sprite
	{
		private var _music:Sound; // Reference to the Sound class
		private var _channel:SoundChannel; // Reference to the soundChannel class
		private var _song:String; // String to hold path of incoming song
		private var _autoplay:Boolean; // Flag used to determine if music should start on load
		private var _isPlaying:Boolean; // Flag used to determine if music is playing or not
		private var _position:Number; // Var to store the position of the music when paused
		
		public function FlashMusicPlayer()
		{						
			if(ExternalInterface.available)
			{
				ExternalInterface.addCallback('start', getSongData); // Allow functions in the JS to call functions in the AS3
				ExternalInterface.addCallback('playMusic', playMusic);
				ExternalInterface.addCallback('pauseMusic', pauseMusic);
        	}
		}
		
		private function getSongData():void
		{			
			if(ExternalInterface.available)
			{
				_song = ExternalInterface.call('songForOldIe'); // Call functions in the HTML to get the JSON values in the config file
           		_autoplay = ExternalInterface.call('autoplayForOldIe');
        	}
						
			_isPlaying = false;
			_position =  0;
			loadSong();
		}
		
		private function loadSong():void
		{
			_music = new Sound();
			_music.load(new URLRequest(_song));
			startMusic();
		}
				
		private function startMusic():void
		{
			if(_autoplay)
			{
				_channel = _music.play(0, int.MAX_VALUE);
				_isPlaying = true;
			}
		}
		
		public function playMusic():void
		{
			if(!_isPlaying)
			{
				_channel = _music.play(_position, int.MAX_VALUE);
				_isPlaying = true;
			}
		}
		
		public function pauseMusic():void
		{
			if(_isPlaying)
			{
				_position = _channel.position;
				_channel.stop();
				_isPlaying = false;
			}
		}
	}
}