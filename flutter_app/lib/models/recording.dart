class ClientModel {
  final String id;
  final String name;

  ClientModel({required this.id, required this.name});

  factory ClientModel.fromJson(Map<String, dynamic> json) {
    return ClientModel(
      id: json['id'],
      name: json['name'],
    );
  }
}

class Recording {
  final String id;
  final DateTime createdAt;
  final String transcript;
  final String summary;
  String status;
  final DateTime? dateRecorded;
  final String type;
  final ClientModel? client;

  Recording({
    required this.id,
    required this.createdAt,
    required this.transcript,
    required this.summary,
    required this.status,
    this.dateRecorded,
    required this.type,
    this.client,
  });

  factory Recording.fromJson(Map<String, dynamic> json) {
    return Recording(
      id: json['id'],
      createdAt: DateTime.parse(json['created_at']),
      transcript: json['transcript'],
      summary: json['summary'],
      status: json['status'],
      dateRecorded: json['date_recorded'] != null ? DateTime.parse(json['date_recorded']) : null,
      type: json['type'] ?? 'memo',
      client: json['client'] != null ? ClientModel.fromJson(json['client']) : null,
    );
  }
}
