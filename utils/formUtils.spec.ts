import { describe, expect, test } from 'vitest'
import * as formUtils from './formUtils'

describe('formUtils', () => {
  test('date is correctly formatted into a string', () => {
    console.log(new Date(2023, 1, 1))
    expect(formUtils.formatDate(new Date(2023, 1, 1))).toBe("2023-01-31")
  })
})
