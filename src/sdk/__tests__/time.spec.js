import * as Time from '../time'
import * as Constants from '../constants'

const _origDate = global.Date

describe('test for time methods', () => {

  afterEach(() => {
    global.Date = _origDate
  })

  it('formats when negative timezone offset', () => {

    let date = new Date(2018, 3, 15, 13, 8, 30)

    jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(-330)

    Utils.mockDate(date)

    expect(Time.getTimestamp()).toBe('2018-04-15T13:08:30.000Z+0530')

  })

  it('formats when positive timezone offset', () => {

    let date = new Date(2017, 10, 6, 9, 40, 4, 45)

    jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(60)

    Utils.mockDate(date)

    expect(Time.getTimestamp()).toBe('2017-11-06T09:40:04.045Z-0100')

  })

  it('formats when no timezone offset', () => {

    let date = new Date(2018, 1, 5, 12, 9, 0, 301)

    jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(0)

    Utils.mockDate(date)

    expect(Time.getTimestamp()).toBe('2018-02-05T12:09:00.301Z+0000')

  })


  it('formats when midnight', () => {

    let date = new Date(2018, 5, 25)

    jest.spyOn(date, 'getTimezoneOffset').mockReturnValue(0)

    Utils.mockDate(date)

    expect(Time.getTimestamp()).toBe('2018-06-25T00:00:00.000Z+0000')

  })

  it('formats passed timestamp', () => {

    expect(Time.getTimestamp(1564478125377)).toBe('2019-07-30T09:15:25.377Z+0000')

  })

  it('calculates the difference between two dates in days', () => {

    let date1 = new Date('2019-01-01T09:00:01.111+0100').getTime()
    let date2 = new Date('2019-02-15T15:10:12.100+0100').getTime()

    expect(Math.round(Time.timePassed(date1, date2)/Constants.DAY)).toBe(45)
    expect(Math.round(Time.timePassed(date1))).toBe(0)

  })

  it('calculates the difference between two dates in hours', () => {

    let date1 = new Date('2019-01-01T09:00:00.000+0100').getTime()
    let date2 = new Date('2019-01-01T15:10:00.000+0100').getTime()

    expect(Math.round(Time.timePassed(date1, date2)/Constants.HOUR)).toBe(6)

    date1 = new Date('2019-01-05T11:10:00.000+0100').getTime()
    date2 = new Date('2019-01-06T08:55:00.000+0100').getTime()

    expect(Math.round(Time.timePassed(date1, date2)/Constants.HOUR)).toBe(22)

  })

  it('calculates the difference between two dates in minutes', () => {

    let date1 = new Date('2019-01-01T09:05:30.000+0100').getTime()
    let date2 = new Date('2019-01-01T09:40:45.000+0100').getTime()

    expect(Math.round(Time.timePassed(date1, date2)/Constants.MINUTE)).toBe(35)

    date1 = new Date('2019-01-01T16:17:00.000+0100').getTime()
    date2 = new Date('2019-01-01T18:42:00.000+0100').getTime()

    expect(Math.round(Time.timePassed(date1, date2)/Constants.MINUTE)).toBe(145)

  })

  it('calculates the difference between two dates in seconds', () => {

    let date1 = new Date('2019-01-01T09:05:30.300+0100').getTime()
    let date2 = new Date('2019-01-01T09:05:45.555+0100').getTime()

    expect(Math.round(Time.timePassed(date1, date2)/Constants.SECOND)).toBe(15)

    date1 = new Date('2019-01-01T09:05:20.200+0100').getTime()
    date2 = new Date('2019-01-01T09:07:04.300+0100').getTime()

    expect(Math.round(Time.timePassed(date1, date2)/Constants.SECOND)).toBe(104)

  })

})
