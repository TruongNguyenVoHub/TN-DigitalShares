class UserProfile {
    //thuoc tinh
    final String walletAddress;
    final String fullName;
    final double vndBalance;
    final double tokenBalance;
    final String kycStatus;
    final bool isWhitelisted;

    //contructor
    UserProfile({
        required this.walletAddress,
        required this.fullName,
        required this.vndBalance,
        required this.tokenBalance,
        required this.kycStatus,
        required this.isWhitelisted,
    });

    //convert/parse json
    factory UserProfile.fromJson(Map<String, dynamic> json){
        return UserProfile(
            walletAddress: json['walletAddress'] as String,
            fullName: json['fullName'] as String,
            vndBalance: (json['vndBalance'] as num).toDouble(),
            tokenBalance: (json['tokenBalance'] as num).toDouble(),
            kycStatus: json['kycStatus'] as String,
            isWhitelisted: json['isWhitelisted'] as bool,
        );
    }
    Map<String,dynamic> toJson() => {
        'walletAddress': walletAddress,
        'fullName': fullName,
        'vndBalance': vndBalance,
        'tokenBalance': tokenBalance,
        'kycStatus': kycStatus,
        'isWhitelisted': isWhitelisted,
    };
    //ham phuc vu chuc nang copy doi tuong
    UserProfile copyWith({
        String? walletAddress,
        String? fullName,
        double? vndBalance,
        double? tokenBalance,
        String? kycStatus,
        bool? isWhitelisted,
    }) {
        return UserProfile(
            walletAddress: walletAddress ?? this.walletAddress,
            fullName: fullName ?? this.fullName,
            vndBalance: vndBalance ?? this.vndBalance,
            tokenBalance: tokenBalance ?? this.tokenBalance,
            kycStatus: kycStatus ?? this.kycStatus,
            isWhitelisted: isWhitelisted ?? this.isWhitelisted,
        );
    }

    
}