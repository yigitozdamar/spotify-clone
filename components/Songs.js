import React from 'react'
import { useRecoilValue } from 'recoil'
import { playlistState } from '../atoms/playlistAtom'
import Song from './Song'

function Songs() {
  const playlist = useRecoilValue(playlistState)

  return (
    <div className="flex flex-col space-y-1 px-8 pb-28 text-white">
      {playlist?.tracks?.items?.map((track, i) => (
        <Song track={track} key={track?.track?.id} order={i} />
      ))}
    </div>
  )
}

export default Songs
