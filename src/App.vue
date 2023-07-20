<template>
  <div class="wrapper">
    <div class="wrap-title" v-if="showTable">
      <p class="title-table">Data Transaksi</p>
      <div style="display: flex; flex-direction: row">
        <p class="title-table">Saldo Akhir :</p>
        <p class="title-table">
          {{ formatPriceRP(transactions[transactions.length - 1].saldo_akhir) }}
        </p>
      </div>
      <vs-button
        success
        @click="showForm"
        style="width: auto; padding: 10px; padding-bottom: 0px; padding-top: 0px; margin-bottom:10px;"
      >
        Create</vs-button
      >
    </div>
    <vs-dialog blur width="550px" class="modal" not-center v-model="showNotification">
      <template #header>
        <h4>Hapus Data Transaksi</h4>
      </template>

      <div style="padding-top: 0px">Apakah Anda yakin menghapus data transaksi ini ?</div>

      <template #footer>
        <div
          style="
            display: flex;
            flex-direction: row;
            justify-content: end;
            align-items: center;
          "
        >
          <vs-button @click="deleteTransaction(form.id)" danger> Ya </vs-button>
          <vs-button @click="showNotification = false" active> Tidak </vs-button>
        </div>
      </template>
    </vs-dialog>

    <vs-dialog blur width="550px" class="modal" not-center v-model="successNotification">
      <p style="text-align: center">Berhasil Menghapus Transaksi</p>
    </vs-dialog>
    <div class="wrapper-content">
      <vs-table v-if="showTable">
        <template #thead v-if="transactions.length">
          <vs-tr>
            <vs-th> Tanggal Transaksi </vs-th>
            <vs-th> Uraian Transaksi </vs-th>
            <vs-th> Tipe Transaksi </vs-th>
            <vs-th> Nominal </vs-th>
            <vs-th> Saldo Akhir </vs-th>
          </vs-tr>
        </template>
        <template #tbody>
          <vs-tr
            :key="i"
            v-for="(tr, i) in transactions"
            :data="tr"
            @click="getDetailTransaction(tr.id)"
          >
            <vs-td>
              {{ tr.tanggal_transaksi }}
            </vs-td>
            <vs-td>
              {{ tr.uraian_transaksi }}
            </vs-td>
            <vs-td>
              {{ tr.tipe_transaksi }}
            </vs-td>
            <vs-td>
              {{ formatPriceRP(tr.nominal) }}
            </vs-td>
            <vs-td>
              {{ formatPriceRP(tr.saldo_akhir) }}
            </vs-td>
          </vs-tr>
        </template>
      </vs-table>
      <div class="content-form" v-else>
        <p class="title-table">Detail Transaksi</p>
        <template>
          <div class="content-inputs" style="padding-top: 15px; padding-bottom: 15px">
            <vs-input
              success
              label-placeholder="Nominal"
              v-model.number="form.nominal"
              type="number"
            />
          </div>
        </template>
        <template>
          <div class="" style="padding-top: 15px; padding-bottom: 15px">
            <vs-input
              success
              label-placeholder="Uraian Transaksi"
              v-model="form.uraian_transaksi"
            />
          </div>
        </template>
        <template>
          <div
            class="center content-inputs"
            style="padding-top: 15px; padding-bottom: 15px"
          >
            <vs-select placeholder="Pilih Tipe Transaksi" v-model="form.tipe_transaksi">
              <vs-option label="Kredit" value="Kredit"> Kredit </vs-option>
              <vs-option label="Debit" value="Debit"> Debit </vs-option>
            </vs-select>
          </div>
        </template>
        <div style="display: flex; flex-direction: row; margin-top: 70px;">
          <vs-button @click="goBack" color="#7d33ff"> Back </vs-button>
          <vs-button
            v-if="type !== 'detail'"
            @click="createTransaction"
            success
            :disabled="!form.tipe_transaksi || !form.uraian_transaksi || !form.nominal"
          >
            Simpan
          </vs-button>
          <vs-button @click="showNotification = true" danger v-if="type === 'detail'">
            Hapus
          </vs-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  components: {},
  mounted() {
    // this.getAllTransaction();
  },
  methods: {
    formatPriceRP(price) {
      if (!price) return "Rp0";
      const result = price.toLocaleString("id");
      return ` Rp ${result}`;
    },
    async getAllTransaction() {
      const loading = this.$vs.loading();
      await axios
        .get(`api/transaction`)
        .then((res) => {
          this.transactions = res.data;
        })
        .catch((err) => {
          alert(err);
        })
        .finally(() => {
          setTimeout(() => {
            loading.close();
          }, 250);
        });
    },
    async getDetailTransaction(id) {
      const loading = this.$vs.loading();
      await axios
        .get(`api/transaction/${id}`)
        .then((res) => {
          this.form = res.data;
          this.showTable = false;
          this.type = "detail";
        })
        .catch((err) => {
          alert(err);
        })
        .finally(() => {
          setTimeout(() => {
            loading.close();
          }, 250);
        });
    },
    async createTransaction() {
      const loading = this.$vs.loading();
      await axios
        .post(`api/transaction/create`, {
          uraian_transaksi: this.form.uraian_transaksi,
          tipe_transaksi: this.form.tipe_transaksi,
          nominal: this.form.nominal,
        })
        .then((res) => {
          alert(
            `Berhasil menambahkan transaksi dan nilai saldo akhir menjadi ${this.formatPriceRP(
              res.data.saldo_akhir
            )}`
          );
          this.showTable = true;
          this.form = { id: 0, uraian_transaksi: "", tipe_transaksi: "", nominal: 0 };
          this.getAllTransaction();
        })
        .catch((err) => {
          console.log(err);
          alert(err.response.data.message);
        })
        .finally(() => {
          loading.close();
        });
    },
    showForm() {
      this.showTable = false;
      this.type = "";
    },
    async deleteTransaction(id) {
      const loading = this.$vs.loading();
      await axios
        .delete(`api/transaction/${id}`)
        .then(() => {
          this.showTable = true;
          this.form = {
            id: 0,
            uraian_transaksi: "",
            tipe_transaksi: "",
            nominal: 0,
          };
          this.showNotification = false;
          this.successNotification = true;
          this.getAllTransaction();
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
        .finally(() => {
          loading.close();
        });
    },
    goBack() {
      this.showTable = true;
      this.form = {
        id: 0,
        uraian_transaksi: "",
        tipe_transaksi: "",
        nominal: 0,
      };
      this.getAllTransaction();
    },
  },

  data() {
    return {
      url: "http://localhost:3000",
      showTable: true,
      showNotification: false,
      type: "",
      form: {
        id: 0,
        uraian_transaksi: "",
        tipe_transaksi: "",
        nominal: 0,
      },
      transactions: [],
      successNotification: false,
    };
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins&display=swap");
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0% 20% 0% 20%;
  margin-top: 5%;
  font-family: "Poppins", sans-serif;
}
.title-table {
  font-weight: 600;
  font-size: 20px;
  color: rgb(23, 201, 100);
  text-align: left;
}
.wrapper-content {
  width: 100%;
  height: 500px;
}

.title-form {
  font-weight: 600;
  font-size: 20px;
  color: rgb(23, 201, 100);
}

.wrap-title {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.content-form {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding-top: 12%;
}
.modal {
  font-family: "Poppins", sans-serif;
}
</style>
