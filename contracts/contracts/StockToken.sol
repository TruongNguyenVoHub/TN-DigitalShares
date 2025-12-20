// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract StockToken is ERC20, ERC20Pausable, AccessControl{
    bytes32 public constant INVENTORY_MANAGER_ROLE = keccak256("INVENTORY_MANAGER_ROLE"); // sử dụng biến hằng để định nghĩa vai trò quản lý kho hàng, kecak256 tạo ra một giá trị băm duy nhất cho vai trò này => chỉ cho phép nhập và xuất hàng
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE"); // vai trò này duyệt thành viên => thêm vào whitelist
    mapping(address => bool) public isWhitelisted; // mapping để kiểm tra địa chỉ có trong whitelist hay không
    AggregatorV3Interface internal priceFeed; // interface để lấy giá cổ phiếu từ Chainlink
    
    event WhiteListUpdated(address indexed user, bool status); // sự kiện để theo dõi việc cập nhật whitelist

    constructor(address _defaultAdmin, address _defaultInventoryManager, address _defaultCompliance, address _priceAddress) ERC20("TruongNguyenToken", "TNT"){
        // Khi nói chuyện, hãy chém gió về Multi-Sig (Giải pháp 1). Nói rằng: "Trong bản production, em sẽ chuyển quyền Admin này cho một ví Gnosis Safe gồm 5 thành viên HĐQT nắm giữ để đảm bảo không ai có thể đơn phương phá hoại hệ thống." -> Nghe cực kỳ chuyên nghiệp.
        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin); // cấp quyền quản trị viên mặc định cho địa chỉ được chỉ định
        _grantRole(INVENTORY_MANAGER_ROLE, _defaultInventoryManager); // cấp quyền quản lý kho hàng cho địa chỉ được chỉ định
        _grantRole(COMPLIANCE_ROLE, _defaultCompliance); // cấp quyền tuân thủ cho địa chỉ được chỉ định

        isWhitelisted[_defaultAdmin] = true; // thêm địa chỉ quản trị viên mặc định vào whitelist
        isWhitelisted[_defaultInventoryManager] = true; // thêm địa chỉ quản lý kho hàng mặc định vào whitelist
        isWhitelisted[_defaultCompliance] = true; // thêm địa chỉ tuân thủ mặc định vào whitelist

        priceFeed = AggregatorV3Interface(_priceAddress); // khởi tạo interface Chainlink với địa chỉ được cung cấp
    }

    // --- CHỨC NĂNG 1: QUẢN LÝ KHO (MINT/BURN) ---
    // in thêm token khi công ty phát hành thêm cổ phiếu
    function mint(address to, uint256 amount) external onlyRole(INVENTORY_MANAGER_ROLE){
        _mint(to, amount);
    }
    // xóa token khi công ty giảm số lượng cổ phiếu
    function burn(address from, uint256 amount) external onlyRole(INVENTORY_MANAGER_ROLE){
        _burn(from, amount);
    }

    // --- CHỨC NĂNG 2: QUẢN LÝ WHITELIST ---
    function setWhitelisted(address user, bool status) external onlyRole(COMPLIANCE_ROLE){
        isWhitelisted[user] = status;
        emit WhiteListUpdated(user, status);
    }

    // --- CHỨC NĂNG 3: TRANSFER (CỐT LÕI) ---
        // Lưu ý: Hàm transfer() đã có sẵn trong ERC20. 
        // Chúng ta chỉ cần viết hàm _update để "gác cổng" (Chặn nếu chưa KYC)
    
    // xai internal de contract nay va contract con thua ke co the su dung chung, neu private thi chi contract nay moi su dung duoc
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value); // goi ham _update cua ERC20 de thuc hien viec chuyen token

        // Luận điểm về Pháp lý: "Cửa vào phải hẹp, Cửa ra phải rộng"
            // Mint (Nhập cảnh):
                // Khi bạn Mint token cho ai đó, nghĩa là bạn đang phát hành Chứng khoán cho họ.
                // Theo luật Chứng khoán và Chống rửa tiền (AML), doanh nghiệp bắt buộc phải biết chính xác người nhận là ai (KYC). Bạn không thể phát hành cổ phiếu cho một bóng ma hoặc một tội phạm rửa tiền.
                // => Do đó: Mint bắt buộc check Whitelist.

            // Burn (Trục xuất/Hủy bỏ):
                // Burn là hành động hủy bỏ nghĩa vụ nợ hoặc tiêu hủy tài sản.
                // Việc làm "biến mất" một lượng cổ phiếu không gây nguy hại về mặt rửa tiền (vì không có tiền bẩn nào được tạo ra thêm).
                // => Do đó: Burn không cần check Whitelist.
        
        //mint them tien
        // Tiền từ hư vô sinh ra.
        if(from == address(0)){
            require(isWhitelisted[to], "Minting to non-KYC forbidden");
        }
        //burn tien
        // Tiền ném vào hư vô.
        else if(to == address(0)){
            //khong can kiem tra whitelist
        }
        //transfer binh thuong
        else{
            // Cả người gửi và người nhận đều phải KYC.
            require(isWhitelisted[from], "Sender not KYC");
            require(isWhitelisted[to], "Receiver not KYC");
        }
    }

    // --- CHỨC NĂNG 4: TIỆN ÍCH KHÁC ---
    // Lấy giá cổ phiếu hiện tại từ Chainlink
    function getLatestPrice() public view returns (int) {
        (
            /* uint80 roundID */,
            int price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        return price; 
    }

    // --- CHỨC NĂNG 5: QUẢN LÝ HỆ THỐNG ---
    // dừng hệ thống
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE){
        _pause();
    }
    // khôi phục hệ thống
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE){
        _unpause();
    }

    
}