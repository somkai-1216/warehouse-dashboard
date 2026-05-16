const API_URL = "https://script.google.com/macros/s/AKfycbzijQxxplorAJGva-EwGn3VAUzwrp118mWenHEZjnE92srbHc2ZyuGS-7-nA53TpdbL/exec";

let tickets = [];

const ticketTable = document.getElementById("ticketTable");
const searchInput = document.getElementById("searchInput");

function normalizeTicket(item) {
  return {
    ticketId: item["Ticket_ID"] || item["Ticket ID"] || "",
    date: formatDate(item["Created_At"] || item["วันที่"] || item["Date"] || ""),
    branch: item["Branch_Code"] || item["สาขา"] || "",
    itemName: item["Item_Name"] || item["ชื่อสินค้า"] || item["สินค้า"] || "",
    issueType: item["Issue_Type"] || item["ประเภทปัญหา"] || "",
    status: item["Status"] || item["สถานะ"] || ""
  };
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

async function loadTickets() {
  try {
    ticketTable.innerHTML = `
      <tr>
        <td colspan="6">กำลังโหลดข้อมูลจาก Google Sheet...</td>
      </tr>
    `;

    const response = await fetch(API_URL);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "โหลดข้อมูลไม่สำเร็จ");
    }

    tickets = result.data.map(normalizeTicket);

    renderDashboard(tickets);
    renderTable(tickets);

    console.log("โหลดข้อมูลสำเร็จ:", tickets);
  } catch (error) {
    console.error("โหลดข้อมูลผิดพลาด:", error);

    ticketTable.innerHTML = `
      <tr>
        <td colspan="6">โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบ API URL หรือสิทธิ์ Apps Script</td>
      </tr>
    `;
  }
}

function renderDashboard(data) {
  const total = data.length;
  const pending = data.filter(item => item.status === "รอดำเนินการ").length;
  const done = data.filter(item => item.status === "เสร็จแล้ว").length;
  const cancel = data.filter(item => item.status === "ยกเลิก").length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("doneCount").textContent = done;
  document.getElementById("cancelCount").textContent = cancel;
}

function getStatusClass(status) {
  if (status === "รอดำเนินการ") return "pending";
  if (status === "เสร็จแล้ว") return "done";
  if (status === "ยกเลิก") return "cancel";
  return "";
}

function renderTable(data) {
  ticketTable.innerHTML = "";

  if (data.length === 0) {
    ticketTable.innerHTML = `
      <tr>
        <td colspan="6">ไม่พบข้อมูล</td>
      </tr>
    `;
    return;
  }

  data.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.ticketId}</td>
      <td>${item.date}</td>
      <td>${item.branch}</td>
      <td>${item.itemName}</td>
      <td>${item.issueType}</td>
      <td>
        <span class="status ${getStatusClass(item.status)}">
          ${item.status}
        </span>
      </td>
    `;

    ticketTable.appendChild(row);
  });
}

searchInput.addEventListener("input", function () {
  const keyword = searchInput.value.toLowerCase();

  const filteredData = tickets.filter(item => {
    return (
      String(item.ticketId).toLowerCase().includes(keyword) ||
      String(item.branch).toLowerCase().includes(keyword) ||
      String(item.itemName).toLowerCase().includes(keyword) ||
      String(item.issueType).toLowerCase().includes(keyword) ||
      String(item.status).toLowerCase().includes(keyword)
    );
  });

  renderDashboard(filteredData);
  renderTable(filteredData);
});

loadTickets();