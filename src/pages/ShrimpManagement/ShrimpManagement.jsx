import React, { useState } from 'react';
import { ToastContainer, toast } from "react-toastify"; // Import thêm toast
import Sidebar from '../../components/Sidebar';
import {
  Tabs,
  Tab,
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Slider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const ShrimpManagement = () => {
  const [tabValue, setTabValue] = useState(0);

  // State cho tab Cho Ăn
  const [feedingData, setFeedingData] = useState({
    pond: '',
    feedType: '',
    feedAmount: '',
    feedDate: null
  });
  const [feedingHistory, setFeedingHistory] = useState([]);
  const [searchFeedDate, setSearchFeedDate] = useState(null);

  // State cho tab Điều Trị
  const [treatmentData, setTreatmentData] = useState({
    pond: '',
    treatmentType: '',
    treatmentAmount: '',
    treatmentDate: null
  });
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [searchTreatmentDate, setSearchTreatmentDate] = useState(null);

  // State cho tab Thông Tin Tôm
  const [shrimpInfo, setShrimpInfo] = useState({
    pond: '',
    shrimpSize: 0,
    shrimpLoss: '',
    updateDate: null
  });
  const [shrimpHistory, setShrimpHistory] = useState([]);
  const [searchShrimpDate, setSearchShrimpDate] = useState(null);

  const ponds = ['Ao 1', 'Ao 2', 'Ao 3', 'Ao 4'];
  const feedTypes = ['Cám 1', 'Cám 2', 'Thức ăn tươi'];
  const treatmentTypes = ['Thuốc A', 'Thuốc B', 'Hóa chất C'];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Xử lý tab Cho Ăn
  const handleFeedingSubmit = () => {
    setFeedingHistory([...feedingHistory, { ...feedingData, id: Date.now() }]);
    setFeedingData({ pond: '', feedType: '', feedAmount: '', feedDate: null });
  };

  // Xử lý tab Điều Trị
  const handleTreatmentSubmit = () => {
    setTreatmentHistory([...treatmentHistory, { ...treatmentData, id: Date.now() }]);
    setTreatmentData({ pond: '', treatmentType: '', treatmentAmount: '', treatmentDate: null });
  };

  // Xử lý tab Thông Tin Tôm
  const handleShrimpInfoSubmit = () => {
    setShrimpHistory([...shrimpHistory, { ...shrimpInfo, id: Date.now() }]);
    setShrimpInfo({ pond: '', shrimpSize: 0, shrimpLoss: '', updateDate: null });
  };

  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && <Box p={3}>{children}</Box>}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2F4F7] ">
    <aside className="h-full">
        <Sidebar />
    </aside>
    <div className="grow pt-5">
        
        <main className="scroll-y h-[calc(100vh-50px)] p-5">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
<Box sx={{ width: '100%' }}>
<Tabs value={tabValue} onChange={handleTabChange}>
  <Tab label="Cho Ăn" />
  <Tab label="Điều Trị" />
  <Tab label="Thông Tin Tôm" />
</Tabs>

{/* Tab Cho Ăn */}
<TabPanel value={tabValue} index={0}>
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6">Nhập Thông Tin Cho Ăn</Typography>
    <Select
      value={feedingData.pond}
      onChange={(e) => setFeedingData({ ...feedingData, pond: e.target.value })}
      displayEmpty
      sx={{ m: 1, minWidth: 120 }}
    >
      <MenuItem value="">Chọn ao</MenuItem>
      {ponds.map((pond) => (
        <MenuItem key={pond} value={pond}>{pond}</MenuItem>
      ))}
    </Select>
    <Select
      value={feedingData.feedType}
      onChange={(e) => setFeedingData({ ...feedingData, feedType: e.target.value })}
      displayEmpty
      sx={{ m: 1, minWidth: 120 }}
    >
      <MenuItem value="">Chọn loại thức ăn</MenuItem>
      {feedTypes.map((type) => (
        <MenuItem key={type} value={type}>{type}</MenuItem>
      ))}
    </Select>
    <TextField
      label="Khối lượng (kg)"
      value={feedingData.feedAmount}
      onChange={(e) => setFeedingData({ ...feedingData, feedAmount: e.target.value })}
      sx={{ m: 1 }}
    />
    <DatePicker
      label="Ngày cho ăn"
      value={feedingData.feedDate}
      onChange={(newValue) => setFeedingData({ ...feedingData, feedDate: newValue })}
      renderInput={(params) => <TextField {...params} sx={{ m: 1 }} />}
    />
    <Button variant="contained" onClick={handleFeedingSubmit} sx={{ m: 1 }}>
      Lưu
    </Button>
  </Box>

  <Box>
    <Typography variant="h6">Tra Cứu Lịch Sử</Typography>
    <DatePicker
      label="Chọn ngày tìm kiếm"
      value={searchFeedDate}
      onChange={(newValue) => setSearchFeedDate(newValue)}
      renderInput={(params) => <TextField {...params} sx={{ m: 1 }} />}
    />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Ao</TableCell>
          <TableCell>Loại thức ăn</TableCell>
          <TableCell>Khối lượng</TableCell>
          <TableCell>Ngày</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {feedingHistory
          .filter((item) => !searchFeedDate || 
            dayjs(item.feedDate).isSame(searchFeedDate, 'day'))
          .map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.pond}</TableCell>
              <TableCell>{item.feedType}</TableCell>
              <TableCell>{item.feedAmount}</TableCell>
              <TableCell>{dayjs(item.feedDate).format('DD/MM/YYYY')}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </Box>
</TabPanel>

{/* Tab Điều Trị */}
<TabPanel value={tabValue} index={1}>
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6">Nhập Thông Tin Điều Trị</Typography>
    <Select
      value={treatmentData.pond}
      onChange={(e) => setTreatmentData({ ...treatmentData, pond: e.target.value })}
      displayEmpty
      sx={{ m: 1, minWidth: 120 }}
    >
      <MenuItem value="">Chọn ao</MenuItem>
      {ponds.map((pond) => (
        <MenuItem key={pond} value={pond}>{pond}</MenuItem>
      ))}
    </Select>
    <Select
      value={treatmentData.treatmentType}
      onChange={(e) => setTreatmentData({ ...treatmentData, treatmentType: e.target.value })}
      displayEmpty
      sx={{ m: 1, minWidth: 120 }}
    >
      <MenuItem value="">Chọn loại điều trị</MenuItem>
      {treatmentTypes.map((type) => (
        <MenuItem key={type} value={type}>{type}</MenuItem>
      ))}
    </Select>
    <TextField
      label="Khối lượng (kg)"
      value={treatmentData.treatmentAmount}
      onChange={(e) => setTreatmentData({ ...treatmentData, treatmentAmount: e.target.value })}
      sx={{ m: 1 }}
    />
    <DatePicker
      label="Ngày điều trị"
      value={treatmentData.treatmentDate}
      onChange={(newValue) => setTreatmentData({ ...treatmentData, treatmentDate: newValue })}
      renderInput={(params) => <TextField {...params} sx={{ m: 1 }} />}
    />
    <Button variant="contained" onClick={handleTreatmentSubmit} sx={{ m: 1 }}>
      Lưu
    </Button>
  </Box>

  <Box>
    <Typography variant="h6">Tra Cứu Lịch Sử</Typography>
    <DatePicker
      label="Chọn ngày tìm kiếm"
      value={searchTreatmentDate}
      onChange={(newValue) => setSearchTreatmentDate(newValue)}
      renderInput={(params) => <TextField {...params} sx={{ m: 1 }} />}
    />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Ao</TableCell>
          <TableCell>Loại điều trị</TableCell>
          <TableCell>Khối lượng</TableCell>
          <TableCell>Ngày</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {treatmentHistory
          .filter((item) => !searchTreatmentDate || 
            dayjs(item.treatmentDate).isSame(searchTreatmentDate, 'day'))
          .map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.pond}</TableCell>
              <TableCell>{item.treatmentType}</TableCell>
              <TableCell>{item.treatmentAmount}</TableCell>
              <TableCell>{dayjs(item.treatmentDate).format('DD/MM/YYYY')}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </Box>
</TabPanel>

{/* Tab Thông Tin Tôm */}
<TabPanel value={tabValue} index={2}>
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6">Cập Nhật Thông Tin Tôm</Typography>
    <Select
      value={shrimpInfo.pond}
      onChange={(e) => setShrimpInfo({ ...shrimpInfo, pond: e.target.value })}
      displayEmpty
      sx={{ m: 1, minWidth: 120 }}
    >
      <MenuItem value="">Chọn ao</MenuItem>
      {ponds.map((pond) => (
        <MenuItem key={pond} value={pond}>{pond}</MenuItem>
      ))}
    </Select>
    <Box sx={{ m: 1, width: 300 }}>
      <Typography>Kích thước tôm (mm)</Typography>
      <Slider
        value={shrimpInfo.shrimpSize}
        onChange={(e, newValue) => setShrimpInfo({ ...shrimpInfo, shrimpSize: newValue })}
        min={0}
        max={200}
        valueLabelDisplay="auto"
      />
    </Box>
    <TextField
      label="Số lượng tôm hao"
      value={shrimpInfo.shrimpLoss}
      onChange={(e) => setShrimpInfo({ ...shrimpInfo, shrimpLoss: e.target.value })}
      sx={{ m: 1 }}
    />
    <DatePicker
      label="Ngày cập nhật"
      value={shrimpInfo.updateDate}
      onChange={(newValue) => setShrimpInfo({ ...shrimpInfo, updateDate: newValue })}
      renderInput={(params) => <TextField {...params} sx={{ m: 1 }} />}
    />
    <Button variant="contained" onClick={handleShrimpInfoSubmit} sx={{ m: 1 }}>
      Lưu
    </Button>
  </Box>

  <Box>
    <Typography variant="h6">Tra Cứu Lịch Sử</Typography>
    <DatePicker
      label="Chọn ngày tìm kiếm"
      value={searchShrimpDate}
      onChange={(newValue) => setSearchShrimpDate(newValue)}
      renderInput={(params) => <TextField {...params} sx={{ m: 1 }} />}
    />
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Ao</TableCell>
          <TableCell>Kích thước (mm)</TableCell>
          <TableCell>Số lượng hao</TableCell>
          <TableCell>Ngày</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {shrimpHistory
          .filter((item) => !searchShrimpDate || 
            dayjs(item.updateDate).isSame(searchShrimpDate, 'day'))
          .map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.pond}</TableCell>
              <TableCell>{item.shrimpSize}</TableCell>
              <TableCell>{item.shrimpLoss}</TableCell>
              <TableCell>{dayjs(item.updateDate).format('DD/MM/YYYY')}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </Box>
</TabPanel>
</Box>
</LocalizationProvider>
        </main>
    </div>
    
        <ToastContainer 
                position="top-right" 
                autoClose={3000} 
                hideProgressBar={false} 
                newestOnTop={false} 
                closeOnClick 
                pauseOnHover 
            />
</div>
  );
};

export default ShrimpManagement;