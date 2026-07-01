import '@testing-library/jest-dom/vitest'
import i18n from '../i18n'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

i18n.changeLanguage('es')

afterEach(() => {
	cleanup()
})