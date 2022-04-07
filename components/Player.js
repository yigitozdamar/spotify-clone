import React, { useCallback, useEffect, useState } from 'react'
import useSpotify from '../hooks/useSpotify'
import { useSession } from 'next-auth/react'
import { useRecoilState } from 'recoil'
import { currentTrackIdState, isPlayingState } from '../atoms/songAtom'
import useSongInfo from '../hooks/useSongInfo'
import { debounce } from 'lodash'
import {
  RewindIcon,
  VolumeUpIcon,
  PlayIcon,
  FastForwardIcon,
  PauseIcon,
  ReplyIcon,
} from '@heroicons/react/solid'
import {
  SwitchHorizontalIcon,
  VolumeUpIcon as VolumeDownIcon,
} from '@heroicons/react/outline'

function Player() {
  const spotifyApi = useSpotify()
  const { data: session, status } = useSession()
  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState)
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState)
  const [volume, setVolume] = useState(50)
  const songInfo = useSongInfo()

  const fetchCurrentSong = async () => {
    if (!songInfo) {
      spotifyApi.getMyCurrentPlaybackState().then((res) => {
        setCurrentTrackId(res?.body?.item?.id)
      })
    }
    spotifyApi.getMyCurrentPlaybackState().then((res) => {
      setIsPlaying(res?.body?.is_playing)
    })
  }
  const handlePlayPause = () => {
    spotifyApi.getMyCurrentPlaybackState().then((res) => {
      if (res?.body?.is_playing) {
        spotifyApi.pause()
        setIsPlaying(false)
      } else {
        spotifyApi.play()
        setIsPlaying(true)
      }
    })
  }

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      // fetch data
      fetchCurrentSong()
      setVolume(50)
    }
  }, [currentTrackIdState, session, spotifyApi])

  useEffect(() => {
    if (volume < 100 && volume > 0) {
      debouncedAdjustVolume(volume)
    }
  }, [volume])

  const debouncedAdjustVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume).catch((err) => {})
    }, 100),
    []
  )

  return (
    <div className=" grid h-24 grid-cols-3 bg-gradient-to-b from-black to-gray-900 px-2 text-xs text-white md:px-8 md:text-base">
      {/* Left */}
      <div className=" flex items-center space-x-4">
        <img
          className=" hidden h-10 w-10 md:inline"
          src={songInfo?.album?.images?.[0]?.url}
          alt=""
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists?.[0]?.name}</p>
        </div>
      </div>
      {/* Center */}
      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />
        <RewindIcon className="button" />
        {isPlaying ? (
          <PauseIcon onClick={handlePlayPause} className="button h-10 w-10" />
        ) : (
          <PlayIcon onClick={handlePlayPause} className="button h-10 w-10" />
        )}
        <FastForwardIcon className="button" />
        <ReplyIcon className="button" />
      </div>
      {/* Right */}
      <div className="flex items-center justify-end space-x-3 pr-5 md:space-x-4">
        <VolumeDownIcon
          onClick={() => volume > 0 && setVolume(volume - 10)}
          className="button"
        />
        <input
          className="w-14 md:w-28"
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <VolumeUpIcon
          onClick={() => volume < 100 && setVolume(volume + 10)}
          className="button"
        />
      </div>
    </div>
  )
}

export default Player
