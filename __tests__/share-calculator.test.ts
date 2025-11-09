import { calculateOldMemberShare, calculateNewMemberShare } from '../lib/share-calculator'

describe('Share Calculator', () => {
  describe('calculateOldMemberShare', () => {
    it('should calculate 30% share for member with 6 months out of 20 total shares', () => {
      const monthsPaid = 6
      const totalShares = 20
      const totalMonths = 6
      
      const result = calculateOldMemberShare(monthsPaid, totalShares, totalMonths)
      
      expect(result).toBe(30)
    })

    it('should calculate 50% share when member paid half of total shares', () => {
      const monthsPaid = 10
      const totalShares = 20
      const totalMonths = 10
      
      const result = calculateOldMemberShare(monthsPaid, totalShares, totalMonths)
      
      expect(result).toBe(50)
    })

    it('should calculate 100% share when member is the only one', () => {
      const monthsPaid = 12
      const totalShares = 12
      const totalMonths = 12
      
      const result = calculateOldMemberShare(monthsPaid, totalShares, totalMonths)
      
      expect(result).toBe(100)
    })

    it('should return 0 when monthsPaid is 0', () => {
      const result = calculateOldMemberShare(0, 20, 6)
      expect(result).toBe(0)
    })

    it('should return 0 when totalShares is 0', () => {
      const result = calculateOldMemberShare(6, 0, 6)
      expect(result).toBe(0)
    })
  })

  describe('calculateNewMemberShare', () => {
    it('should calculate 2.439% share for member with 1500 contribution out of 61500 total', () => {
      const monthsPaid = 3
      const previousTotal = 60000
      const newMonthTotal = 1500
      
      const result = calculateNewMemberShare(monthsPaid, previousTotal, newMonthTotal)
      
      expect(result).toBeCloseTo(2.439, 2)
    })

    it('should calculate 1.639% share for member with 1000 contribution out of 61000 total', () => {
      const monthsPaid = 2
      const previousTotal = 60000
      const newMonthTotal = 1000
      
      const result = calculateNewMemberShare(monthsPaid, previousTotal, newMonthTotal)
      
      expect(result).toBeCloseTo(1.639, 2)
    })

    it('should calculate 100% share when member is first and only contributor', () => {
      const monthsPaid = 6
      const previousTotal = 0
      const newMonthTotal = 3000
      
      const result = calculateNewMemberShare(monthsPaid, previousTotal, newMonthTotal)
      
      expect(result).toBe(100)
    })

    it('should return 0 when monthsPaid is 0', () => {
      const result = calculateNewMemberShare(0, 60000, 1500)
      expect(result).toBe(0)
    })

    it('should return 0 when total fund is 0', () => {
      const result = calculateNewMemberShare(3, 0, 0)
      expect(result).toBe(0)
    })
  })
})
