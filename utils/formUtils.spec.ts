import { describe, expect, test } from 'vitest'
import * as formUtils from './formUtils'

describe('formUtils', () => {
  test('date is correctly formatted into a string', () => {
    expect(formUtils.formatDate(new Date(2023, 1, 1))).toBe("2023-01-31")
  })

  test('earliest date is returned from a array of dates', () => {
    expect(formUtils.findSmallestDate([
      "2023-05-27",
      "2023-02-01",
      "2023-04-18",
      "2023-09-10",
      "2023-01-02"
    ])).toBe("2023-01-02")
  })

  test('latest date is returned from a array of dates', () => {
    expect(formUtils.findBiggestDate([
      "2023-05-27",
      "2023-02-01",
      "2023-04-18",
      "2023-09-10",
      "2023-01-02"
    ])).toBe("2023-09-10")
  })
})
