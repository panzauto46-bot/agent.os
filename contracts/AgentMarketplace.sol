// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgentMarketplace
 * @dev Autonomous Agent-to-Agent NFT Marketplace on SKALE Network
 * @notice Gasless transactions on SKALE — perfect for AI agent micro-negotiations
 */
contract AgentMarketplace {
    struct Listing {
        address seller;
        string itemName;
        uint256 price;
        bool active;
    }

    struct Deal {
        uint256 listingId;
        address seller;
        address buyer;
        uint256 agreedPrice;
        uint256 timestamp;
        bool completed;
    }

    // State
    uint256 public listingCount;
    uint256 public dealCount;
    uint256 public totalVolume;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Deal) public deals;
    mapping(address => uint256) public agentBalances;

    // Events
    event ItemListed(uint256 indexed listingId, address indexed seller, string itemName, uint256 price);
    event NegotiationStarted(uint256 indexed dealId, uint256 indexed listingId, address buyer);
    event DealCompleted(uint256 indexed dealId, address indexed seller, address indexed buyer, uint256 price);
    event DealCancelled(uint256 indexed dealId);
    event FundsDeposited(address indexed agent, uint256 amount);
    event FundsWithdrawn(address indexed agent, uint256 amount);

    // Modifiers
    modifier onlyActiveListing(uint256 _listingId) {
        require(_listingId < listingCount, "Listing does not exist");
        require(listings[_listingId].active, "Listing is not active");
        _;
    }

    // === CORE FUNCTIONS ===

    /// @notice List an item for sale
    function listItem(string calldata _itemName, uint256 _price) external returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_itemName).length > 0, "Item name required");

        uint256 listingId = listingCount;
        listings[listingId] = Listing({
            seller: msg.sender,
            itemName: _itemName,
            price: _price,
            active: true
        });

        listingCount++;
        emit ItemListed(listingId, msg.sender, _itemName, _price);
        return listingId;
    }

    /// @notice Deposit funds (agent funding)
    function depositFunds() external payable {
        require(msg.value > 0, "Must deposit some funds");
        agentBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    /// @notice Execute a deal between buyer and seller
    function executeDeal(uint256 _listingId, uint256 _agreedPrice)
        external
        payable
        onlyActiveListing(_listingId)
        returns (uint256)
    {
        Listing storage listing = listings[_listingId];
        require(msg.sender != listing.seller, "Cannot buy your own item");
        require(msg.value >= _agreedPrice, "Insufficient payment");

        // Create deal record
        uint256 dealId = dealCount;
        deals[dealId] = Deal({
            listingId: _listingId,
            seller: listing.seller,
            buyer: msg.sender,
            agreedPrice: _agreedPrice,
            timestamp: block.timestamp,
            completed: true
        });

        // Transfer funds to seller
        payable(listing.seller).transfer(_agreedPrice);

        // Refund excess
        if (msg.value > _agreedPrice) {
            payable(msg.sender).transfer(msg.value - _agreedPrice);
        }

        // Update state
        listing.active = false;
        dealCount++;
        totalVolume += _agreedPrice;

        emit DealCompleted(dealId, listing.seller, msg.sender, _agreedPrice);
        return dealId;
    }

    /// @notice Cancel a listing (only seller)
    function cancelListing(uint256 _listingId) external onlyActiveListing(_listingId) {
        require(listings[_listingId].seller == msg.sender, "Not the seller");
        listings[_listingId].active = false;
    }

    /// @notice Withdraw deposited funds
    function withdrawFunds(uint256 _amount) external {
        require(agentBalances[msg.sender] >= _amount, "Insufficient balance");
        agentBalances[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit FundsWithdrawn(msg.sender, _amount);
    }

    // === VIEW FUNCTIONS ===

    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return listings[_listingId];
    }

    function getDeal(uint256 _dealId) external view returns (Deal memory) {
        return deals[_dealId];
    }

    function getAgentBalance(address _agent) external view returns (uint256) {
        return agentBalances[_agent];
    }

    function getMarketStats() external view returns (uint256 _listings, uint256 _deals, uint256 _volume) {
        return (listingCount, dealCount, totalVolume);
    }
}
