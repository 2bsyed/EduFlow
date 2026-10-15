def test_reject_cross_institute_fees(client, owner_token):
    # Owner 1 (inst-1) attempts to record fee for student-2 (inst-2)
    res = client.post("/api/fees/", headers={"Authorization": f"Bearer {owner_token}"}, json={
        "student_id": "student-2",
        "amount": 100,
        "date": "2024-01-01",
        "payment_method": "CASH"
    })
    
    assert res.status_code == 404
    assert res.json()["detail"] == "Student not found"
