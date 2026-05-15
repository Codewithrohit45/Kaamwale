const User = require('../models/User');
const Payout = require('../models/Payout');

// @desc    Update provider payout details
// @route   PUT /api/payouts/details
// @access  Private/Provider
exports.updatePayoutDetails = async (req, res) => {
  try {
    const { accountHolder, accountNumber, ifscCode, vpa } = req.body;
    
    const user = await User.findById(req.user.id);
    user.payoutDetails = { accountHolder, accountNumber, ifscCode, vpa };
    user.payoutStatus = 'pending'; // Needs admin verification or automated check
    await user.save();

    res.json({ message: 'Payout details updated and pending verification', payoutDetails: user.payoutDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request a withdrawal
// @route   POST /api/payouts/request
// @access  Private/Provider
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method } = req.body;
    const user = await User.findById(req.user.id);

    if (user.payoutStatus !== 'verified' && user.payoutStatus !== 'pending') {
      return res.status(400).json({ message: 'Please configure payout details first' });
    }

    if (amount < 500) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹500' });
    }

    if (user.withdrawableBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create Payout record
    const payout = await Payout.create({
      provider: user._id,
      amount,
      method,
      payoutDetails: user.payoutDetails,
      status: 'pending'
    });

    // Deduct from withdrawable balance immediately
    user.withdrawableBalance -= amount;
    await user.save();

    res.status(201).json({ message: 'Withdrawal request submitted successfully', payout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get provider's payout history
// @route   GET /api/payouts/my-payouts
// @access  Private/Provider
exports.getMyPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ provider: req.user.id }).sort({ createdAt: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get all pending payouts
// @route   GET /api/payouts/admin/requests
// @access  Private/Admin
exports.getAllPayoutRequests = async (req, res) => {
  try {
    const payouts = await Payout.find({ status: 'pending' })
      .populate('provider', 'name email phone payoutStatus')
      .sort({ createdAt: 1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Process a payout
// @route   PUT /api/payouts/admin/:id/process
// @access  Private/Admin
exports.processPayout = async (req, res) => {
  try {
    const { action, comments } = req.body; // 'complete' or 'fail'
    const payout = await Payout.findById(req.params.id);

    if (!payout) return res.status(404).json({ message: 'Payout request not found' });

    if (action === 'complete') {
      payout.status = 'completed';
      payout.referenceId = 'RAZORPAYX_' + Math.random().toString(36).substring(7).toUpperCase();
      payout.processedAt = Date.now();
    } else {
      payout.status = 'failed';
      payout.failureReason = comments || 'Transaction failed by bank';
      
      // Refund back to provider's balance
      const provider = await User.findById(payout.provider);
      provider.withdrawableBalance += payout.amount;
      await provider.save();
    }

    payout.adminComments = comments;
    await payout.save();

    res.json({ message: `Payout marked as ${payout.status}`, payout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
