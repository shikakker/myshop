import { useEffect } from 'react'
import { useUI } from '@components/ui/context'
import { getRandomPairOfColors } from '@lib/colors'

export const useUserAvatar = (name = 'userAvatar') => {
  const { userAvatar, setUserAvatar } = useUI()

  useEffect(() => {
    const storedAvatar = localStorage.getItem(name)

    if (!userAvatar && storedAvatar) {
      setUserAvatar(storedAvatar)
      return
    }

    if (!storedAvatar) {
      const bg = getRandomPairOfColors()
      const value = `linear-gradient(140deg, ${bg[0]}, ${bg[1]} 100%)`
      localStorage.setItem(name, value)
      setUserAvatar(value)
    }
  }, [name, setUserAvatar, userAvatar])

  return {
    userAvatar,
    setUserAvatar,
  }
}
