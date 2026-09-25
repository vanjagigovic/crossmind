import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getRefreshToken, getUser } from '../../auth/auth-storage'
import { logout } from '../../auth/api/auth'



export function UserMenu() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const user = getUser()

  if (!user) {
    return null
  }

  const initials = user.isGuest
    ? 'G'
    : user.displayName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

  async function handleLogout() {
    const refreshToken = getRefreshToken()

    try {
      if (refreshToken) {
        await logout(refreshToken)
      }
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <div className="user-menu">
      <button
        className="user-menu__trigger"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {initials}
        </span>

        <span className="user-menu__name">
          {user.displayName}
        </span>

        <span className="user-menu__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__identity">
            <strong>{user.displayName}</strong>

            {user.email && (
              <span>{user.email}</span>
            )}
          </div>

          <div className="user-menu__separator" />

          <button
            className="user-menu__item"
            type="button"
            role="menuitem"
            disabled
          >
            Account settings
          </button>

          <button
            className="user-menu__item"
            type="button"
            role="menuitem"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}